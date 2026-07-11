'use server'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { CACHE_TAGS } from '@lib/cachedReads'
import { PriceRange } from '@domain/place/PriceRange'
import { ReservationPolicy } from '@domain/place/ReservationPolicy'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { UnauthorizedBusinessAccessError } from '@domain/business/errors/UnauthorizedBusinessAccessError'

type ActionResult = { error: string } | { success: true }

// z.url() acepta cualquier esquema (javascript:, data:…); estos enlaces van a un
// href en la ficha pública → exigimos http(s) explícito (defensa anti-XSS).
const httpUrl = z
  .string()
  .trim()
  .url('Debe ser un enlace válido.')
  .refine((u) => /^https?:\/\//i.test(u), 'El enlace debe empezar con http:// o https://')

// Solo campos operacionales. El enum vacío ('') = "sin especificar" → undefined.
const editSchema = z.object({
  slug: z.string().min(1),
  description: z.string().trim().max(4000).optional(),
  schedule: z.string().trim().max(2000).optional(),
  phone: z.string().trim().max(40).optional(),
  website: httpUrl.optional().or(z.literal('')),
  instagram: z.string().trim().max(120).optional(),
  menuUrl: httpUrl.optional().or(z.literal('')),
  priceRange: z.nativeEnum(PriceRange).optional().or(z.literal('')),
  reservation: z.nativeEnum(ReservationPolicy).optional().or(z.literal('')),
})

function clean(v: string | undefined): string | undefined {
  return v && v.length > 0 ? v : undefined
}

export async function updateOwnedPlaceAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Inicia sesión para editar tu ficha.' }

  const parsed = editSchema.safeParse({
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    schedule: formData.get('schedule') || undefined,
    phone: formData.get('phone') || undefined,
    website: formData.get('website') || undefined,
    instagram: formData.get('instagram') || undefined,
    menuUrl: formData.get('menuUrl') || undefined,
    priceRange: formData.get('priceRange') || undefined,
    reservation: formData.get('reservation') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  const d = parsed.data
  try {
    await container.getUpdateOwnedPlaceInfoUseCase().execute(session.user.id, d.slug, {
      description: clean(d.description),
      schedule: clean(d.schedule),
      phone: clean(d.phone),
      website: clean(d.website),
      instagram: clean(d.instagram),
      menuUrl: clean(d.menuUrl),
      priceRange: (d.priceRange || undefined) as PriceRange | undefined,
      reservation: (d.reservation || undefined) as ReservationPolicy | undefined,
    })
  } catch (err) {
    if (err instanceof UnauthorizedBusinessAccessError) return { error: 'No gestionas esta ficha.' }
    if (err instanceof PlaceNotFoundError) return { error: 'Esta ficha ya no existe.' }
    throw err
  }

  // El contenido público está cacheado por tag: al editar, se invalida al tiro.
  revalidateTag(CACHE_TAGS.places)
  return { success: true }
}
