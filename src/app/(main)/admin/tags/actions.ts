'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { TagNotFoundError } from '@application/listing/ResolveListingTagUseCase'
import { UnauthorizedError } from '@application/errors'

const schema = z.object({
  tagId: z.string().min(1),
  listingId: z.string().min(1),
  decision: z.enum(['APPROVE', 'REJECT']),
})

export async function resolveTagAction(
  tagId: string,
  listingId: string,
  decision: 'APPROVE' | 'REJECT',
) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autorizado' }

  const parsed = schema.safeParse({ tagId, listingId, decision })
  if (!parsed.success) return { error: 'Parámetros inválidos' }

  try {
    const useCase = container.getResolveListingTagUseCase()
    await useCase.execute({
      tagId: parsed.data.tagId,
      listingId: parsed.data.listingId,
      adminId: session.user.id,
      decision: parsed.data.decision,
    })
    revalidatePath('/admin/tags')
    return { success: true }
  } catch (err) {
    if (err instanceof UnauthorizedError) return { error: 'No autorizado' }
    if (err instanceof TagNotFoundError) return { error: 'El tag no está disponible para resolver' }
    console.error('[resolveTagAction]', err)
    return { error: 'Error inesperado. Intenta de nuevo.' }
  }
}
