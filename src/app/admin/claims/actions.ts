'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { ClaimNotFoundError, ClaimNotPendingError } from '@application/listing/ResolveListingClaimUseCase'
import { UnauthorizedError } from '@application/errors'

const schema = z.object({
  claimId: z.string().min(1),
  decision: z.enum(['APPROVE', 'REJECT']),
  reviewNote: z.string().max(1000).optional(),
})

export async function resolveClaimAction(
  claimId: string,
  decision: 'APPROVE' | 'REJECT',
  reviewNote?: string,
) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autorizado' }

  const parsed = schema.safeParse({ claimId, decision, reviewNote })
  if (!parsed.success) return { error: 'Parámetros inválidos' }

  try {
    const useCase = container.getResolveListingClaimUseCase()
    await useCase.execute({
      claimId: parsed.data.claimId,
      adminId: session.user.id,
      decision: parsed.data.decision,
      reviewNote: parsed.data.reviewNote,
    })
    revalidatePath('/admin/claims')
    return { success: true }
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: 'No autorizado' }
    if (err instanceof ClaimNotFoundError || err instanceof ClaimNotPendingError) {
      return { error: 'El claim no está disponible para resolver' }
    }
    console.error('[resolveClaimAction]', err)
    return { error: 'Error inesperado. Intenta de nuevo.' }
  }
}
