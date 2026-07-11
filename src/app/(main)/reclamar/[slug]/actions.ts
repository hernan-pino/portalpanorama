'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { getPlaceDetailCached } from '@lib/cachedReads'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'
import { DuplicateClaimError } from '@domain/business/errors/DuplicateClaimError'
import { TargetAlreadyOwnedError } from '@domain/business/errors/TargetAlreadyOwnedError'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { BrandNotFoundError } from '@domain/brand/errors/BrandNotFoundError'

type ActionResult = { error: string } | { success: true }

const claimSchema = z.object({
  slug: z.string().min(1),
  kind: z.enum(['place', 'brand']),
  role: z.enum(['Dueño/a', 'Representante legal', 'Encargado/a o administrador/a']),
  message: z.string().trim().max(1000, 'Máximo 1000 caracteres.').optional(),
  contactEmail: z.string().trim().email('Ingresa un correo válido.').optional(),
  contactPhone: z.string().trim().max(30, 'Máximo 30 caracteres.').optional(),
})

// El objetivo (lugar o marca) se resuelve SIEMPRE en el server por su slug; el
// cliente nunca envía id ni nombre. Devuelve { id, name } o un mensaje de error.
async function resolveTarget(
  kind: 'place' | 'brand',
  slug: string,
): Promise<{ id: string; name: string } | { error: string }> {
  try {
    if (kind === 'brand') {
      const brand = await container.getGetBrandPageUseCase().execute(slug)
      return { id: brand.id, name: brand.name }
    }
    const place = (await getPlaceDetailCached(slug)).place
    return { id: place.id, name: place.name }
  } catch (err) {
    if (err instanceof PlaceNotFoundError || err instanceof BrandNotFoundError) {
      return { error: 'Este negocio ya no existe.' }
    }
    throw err
  }
}

export async function createClaimAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return { error: 'Inicia sesión para reclamar tu ficha.' }
  }

  // Anti-spam: pocos reclamos legítimos salen de una misma IP en una hora.
  const ip = await clientIp()
  if (!(await rateLimitDurable(`claim:${ip}`, 3, 60 * 60_000)).ok) {
    return { error: 'Recibimos varios reclamos desde aquí. Prueba de nuevo más tarde.' }
  }

  const parsed = claimSchema.safeParse({
    slug: formData.get('slug'),
    kind: formData.get('kind'),
    role: formData.get('role'),
    message: formData.get('message') || undefined,
    contactEmail: formData.get('contactEmail') || undefined,
    contactPhone: formData.get('contactPhone') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  const target = await resolveTarget(parsed.data.kind, parsed.data.slug)
  if ('error' in target) return { error: target.error }

  try {
    await container.getCreateBusinessClaimUseCase().execute({
      claimantId: session.user.id,
      claimantName: session.user.name ?? 'Hola',
      claimantEmail: session.user.email,
      placeId: parsed.data.kind === 'place' ? target.id : undefined,
      brandId: parsed.data.kind === 'brand' ? target.id : undefined,
      targetName: target.name,
      claimantRole: parsed.data.role,
      message: parsed.data.message,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
    })
  } catch (err) {
    if (err instanceof DuplicateClaimError) {
      return { error: 'Ya tienes un reclamo pendiente por este negocio. Te avisaremos por correo cuando lo revisemos.' }
    }
    if (err instanceof TargetAlreadyOwnedError) {
      return { error: 'Este negocio ya fue reclamado y verificado por su dueño. Si crees que es un error, escríbenos a hola@portalpanorama.cl.' }
    }
    throw err
  }

  return { success: true }
}
