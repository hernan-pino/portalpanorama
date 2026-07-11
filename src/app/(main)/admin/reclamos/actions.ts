'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { InvalidClaimTransitionError } from '@domain/business/errors/InvalidClaimTransitionError'
import { ClaimNotFoundError } from '@domain/business/errors/ClaimNotFoundError'
import { TargetAlreadyOwnedError } from '@domain/business/errors/TargetAlreadyOwnedError'

type ActionResult = { error: string } | { success: true }

async function adminId(): Promise<string | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return (session.user as { role?: string }).role === 'ADMIN' ? session.user.id : null
}

const decisionSchema = z.object({
  id: z.string().min(1),
  notes: z.string().trim().max(1000, 'Máximo 1000 caracteres.').optional(),
})

export async function approveClaimAction(id: unknown, notes: unknown): Promise<ActionResult> {
  const reviewerId = await adminId()
  if (!reviewerId) return { error: 'No autorizado.' }
  const parsed = decisionSchema.safeParse({ id, notes: notes || undefined })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  try {
    await container.getApproveBusinessClaimUseCase().execute(parsed.data.id, reviewerId, parsed.data.notes)
  } catch (err) {
    if (err instanceof InvalidClaimTransitionError) return { error: 'Este reclamo ya fue revisado.' }
    if (err instanceof ClaimNotFoundError) return { error: 'El reclamo ya no existe.' }
    if (err instanceof TargetAlreadyOwnedError) {
      return { error: 'Esta ficha ya fue asignada a otro dueño (quizás otro reclamo del mismo lugar). Refresca la bandeja.' }
    }
    throw err
  }
  revalidatePath('/admin/reclamos')
  return { success: true }
}

export async function rejectClaimAction(id: unknown, notes: unknown): Promise<ActionResult> {
  const reviewerId = await adminId()
  if (!reviewerId) return { error: 'No autorizado.' }
  const parsed = decisionSchema.safeParse({ id, notes: notes || undefined })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }
  try {
    await container.getRejectBusinessClaimUseCase().execute(parsed.data.id, reviewerId, parsed.data.notes)
  } catch (err) {
    if (err instanceof InvalidClaimTransitionError) return { error: 'Este reclamo ya fue revisado.' }
    if (err instanceof ClaimNotFoundError) return { error: 'El reclamo ya no existe.' }
    throw err
  }
  revalidatePath('/admin/reclamos')
  return { success: true }
}
