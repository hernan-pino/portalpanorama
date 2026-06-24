'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { UserRole } from '@domain/user/UserRole'
import { DomainError } from '@domain/shared/DomainError'

// Transporte puro: valida sesión ADMIN + input (Zod) y delega en el use case.

type ActionResult = { error: string } | { success: true }

const schema = z.object({
  targetUserId: z.string().min(1),
  role: z.enum(['USER', 'ADMIN']),
})

export async function setUserRoleAction(input: unknown): Promise<ActionResult> {
  const session = await auth()
  const actingUserId = session?.user?.id
  const isAdmin = Boolean(actingUserId) && (session!.user as { role?: string }).role === 'ADMIN'
  if (!isAdmin || !actingUserId) return { error: 'No autorizado.' }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: 'Datos inválidos.' }

  try {
    await container.getSetUserRoleUseCase().execute({
      actingUserId,
      targetUserId: parsed.data.targetUserId,
      role: parsed.data.role as UserRole,
    })
    revalidatePath('/admin/usuarios')
    return { success: true }
  } catch (error) {
    if (error instanceof DomainError) return { error: error.message }
    return { error: 'No se pudo cambiar el rol. Intenta de nuevo.' }
  }
}
