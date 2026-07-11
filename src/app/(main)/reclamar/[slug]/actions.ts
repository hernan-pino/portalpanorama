'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { getPlaceDetailCached } from '@lib/cachedReads'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'
import { DuplicateClaimError } from '@domain/business/errors/DuplicateClaimError'
import { TargetAlreadyOwnedError } from '@domain/business/errors/TargetAlreadyOwnedError'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'

type ActionResult = { error: string } | { success: true }

const claimSchema = z.object({
  slug: z.string().min(1),
  role: z.enum(['Dueño/a', 'Representante legal', 'Encargado/a o administrador/a']),
  message: z.string().trim().max(1000, 'Máximo 1000 caracteres.').optional(),
  contactEmail: z.string().trim().email('Ingresa un correo válido.').optional(),
  contactPhone: z.string().trim().max(30, 'Máximo 30 caracteres.').optional(),
})

export async function createClaimAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return { error: 'Inicia sesión para reclamar una ficha.' }
  }

  // Anti-spam: pocos reclamos legítimos salen de una misma IP en una hora.
  const ip = await clientIp()
  if (!(await rateLimitDurable(`claim:${ip}`, 3, 60 * 60_000)).ok) {
    return { error: 'Recibimos varios reclamos desde aquí. Prueba de nuevo más tarde.' }
  }

  const parsed = claimSchema.safeParse({
    slug: formData.get('slug'),
    role: formData.get('role'),
    message: formData.get('message') || undefined,
    contactEmail: formData.get('contactEmail') || undefined,
    contactPhone: formData.get('contactPhone') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  // El lugar se resuelve en el server (id y nombre nunca vienen del form).
  let place
  try {
    place = (await getPlaceDetailCached(parsed.data.slug)).place
  } catch (err) {
    if (err instanceof PlaceNotFoundError) return { error: 'Este lugar ya no existe.' }
    throw err
  }

  try {
    await container.getCreateBusinessClaimUseCase().execute({
      claimantId: session.user.id,
      claimantName: session.user.name ?? 'Hola',
      claimantEmail: session.user.email,
      placeId: place.id,
      targetName: place.name,
      claimantRole: parsed.data.role,
      message: parsed.data.message,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
    })
  } catch (err) {
    if (err instanceof DuplicateClaimError) {
      return { error: 'Ya tienes un reclamo pendiente por esta ficha. Te avisaremos por correo cuando lo revisemos.' }
    }
    if (err instanceof TargetAlreadyOwnedError) {
      return { error: 'Esta ficha ya fue reclamada y verificada por su dueño. Si crees que es un error, escríbenos a hola@portalpanorama.cl.' }
    }
    throw err
  }

  return { success: true }
}
