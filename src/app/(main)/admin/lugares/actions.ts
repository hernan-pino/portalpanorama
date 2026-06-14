'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { ALLOWED_IMAGE_HOSTS, isAllowedImageUrl } from '@lib/imageHosts'
import { DomainError } from '@domain/shared/DomainError'
import { PriceRange } from '@domain/place/PriceRange'
import { ReservationPolicy } from '@domain/place/ReservationPolicy'
import { RainPolicy } from '@domain/place/RainPolicy'
import type { PlaceWriteInput } from '@application/place/PlaceWriteInput'
import type { PlaceFormValues } from './types'

// Transporte puro: valida sesión ADMIN + input (Zod) y delega en los use cases.
// El form de cliente arma el PlaceFormValues; acá se coacciona a PlaceWriteInput.

type ActionResult = { error: string } | { success: true }

async function isAdmin(): Promise<boolean> {
  const session = await auth()
  return Boolean(session?.user) && (session!.user as { role?: string }).role === 'ADMIN'
}

// '' → undefined para los campos opcionales (los <input> siempre mandan string).
const emptyToUndef = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const optionalText = z.preprocess(emptyToUndef, z.string().trim().optional())
const optionalUrl = z.preprocess(emptyToUndef, z.string().trim().url('URL inválida.').optional())
const optionalNumber = z.preprocess(emptyToUndef, z.coerce.number().optional())
const optionalEnum = <const T extends [string, ...string[]]>(values: T) =>
  z.preprocess(emptyToUndef, z.enum(values).optional())

const pointSchema = z.object({
  name: z.string().trim().min(1, 'Cada punto necesita un nombre.'),
  description: z.preprocess(emptyToUndef, z.string().trim().optional()),
  kind: z.preprocess(emptyToUndef, z.string().trim().optional()),
})

const imageSchema = z.object({
  // El host tiene que estar en la allowlist de next/image: una URL de un host no
  // permitido pasa al guardar pero tumba la ficha entera con 500 al renderizar.
  url: z
    .string()
    .trim()
    .url('Cada imagen necesita una URL válida.')
    .refine(isAllowedImageUrl, {
      message: `La imagen debe venir de un host permitido (${ALLOWED_IMAGE_HOSTS.join(', ')}).`,
    }),
  alt: z.preprocess(emptyToUndef, z.string().trim().optional()),
  credit: z.preprocess(emptyToUndef, z.string().trim().optional()),
  isPrimary: z.boolean(),
})

const placeSchema = z
  .object({
    name: z.string().trim().min(2, 'El nombre es obligatorio.'),
    description: optionalText,
    menuUrl: optionalUrl,

    categoryId: z.string().min(1, 'Elegí una categoría.'),
    subcategoryId: z.string().min(1, 'Elegí una subcategoría.'),
    secondaryCategoryId: optionalText,
    secondarySubcategoryId: optionalText,

    address: optionalText,
    communeId: z.string().min(1, 'Elegí una comuna.'),
    neighborhoodId: optionalText,
    lat: optionalNumber,
    lng: optionalNumber,
    metroStationId: optionalText,
    accessDetail: optionalText,
    reference: optionalText,
    rainPolicy: optionalEnum(['SUSPENDED', 'RELOCATED', 'CONTINUES']),

    priceRange: optionalEnum([
      'FREE',
      'UNDER_5000',
      'FROM_5000_TO_15000',
      'FROM_15000_TO_30000',
      'OVER_30000',
    ]),
    reservation: optionalEnum(['REQUIRED', 'WALK_IN', 'RECOMMENDED']),
    paymentMethods: z.array(z.string()).optional().default([]),
    schedule: optionalText,

    phone: optionalText,
    website: optionalUrl,
    instagram: optionalText,

    googlePlaceId: optionalText,
    googleRating: z.preprocess(
      emptyToUndef,
      z.coerce
        .number()
        .min(1, 'Las estrellas de Google van de 1 a 5.')
        .max(5, 'Las estrellas de Google van de 1 a 5.')
        .optional(),
    ),
    googleReviewCount: z.preprocess(
      emptyToUndef,
      z.coerce.number().int('El n° de reseñas debe ser entero.').min(0).optional(),
    ),

    isPremium: z.boolean().optional().default(false),
    parentId: optionalText,
    tagIds: z.array(z.string()).optional().default([]),
    images: z.array(imageSchema).optional().default([]),
    points: z.array(pointSchema).optional().default([]),
  })
  // Categoría secundaria = par (B.5): si va una, va su subcategoría.
  .refine((d) => !d.secondaryCategoryId || Boolean(d.secondarySubcategoryId), {
    message: 'Si pones categoría secundaria, elegí también su subcategoría.',
    path: ['secondarySubcategoryId'],
  })

type ParsedPlace = z.infer<typeof placeSchema>

// Mapea el input validado al PlaceWriteInput del use case. Los enums del dominio
// son string-enums con los mismos valores, así que el cast es seguro tras Zod.
function toWriteInput(d: ParsedPlace): PlaceWriteInput {
  const paymentMethods = d.paymentMethods.map((s) => s.trim()).filter(Boolean)

  // Garantiza exactamente una imagen primaria si hay imágenes.
  const hasPrimary = d.images.some((img) => img.isPrimary)
  const images = d.images.map((img, i) => ({
    url: img.url,
    alt: img.alt,
    credit: img.credit,
    isPrimary: hasPrimary ? img.isPrimary : i === 0,
    sortOrder: i,
  }))

  return {
    name: d.name,
    description: d.description,
    menuUrl: d.menuUrl,
    categoryId: d.categoryId,
    subcategoryId: d.subcategoryId,
    secondaryCategoryId: d.secondaryCategoryId,
    secondarySubcategoryId: d.secondarySubcategoryId,
    address: d.address,
    communeId: d.communeId,
    neighborhoodId: d.neighborhoodId,
    lat: d.lat,
    lng: d.lng,
    metroStationId: d.metroStationId,
    accessDetail: d.accessDetail,
    reference: d.reference,
    rainPolicy: d.rainPolicy as RainPolicy | undefined,
    priceRange: d.priceRange as PriceRange | undefined,
    reservation: d.reservation as ReservationPolicy | undefined,
    paymentMethods,
    schedule: d.schedule,
    phone: d.phone,
    website: d.website,
    instagram: d.instagram,
    googlePlaceId: d.googlePlaceId,
    googleRating: d.googleRating,
    googleReviewCount: d.googleReviewCount,
    isPremium: d.isPremium,
    parentId: d.parentId,
    tagIds: d.tagIds,
    images,
    points: d.points.map((pt, i) => ({
      name: pt.name,
      description: pt.description,
      kind: pt.kind,
      sortOrder: i,
    })),
  }
}

// Traduce errores conocidos a un mensaje accionable; el resto = genérico.
function toErrorMessage(err: unknown): string {
  if (err instanceof DomainError) return err.message
  if (typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002') {
    return 'Ya existe un lugar con ese nombre (slug duplicado). Cambiá el nombre.'
  }
  return 'No se pudo guardar el lugar. Revisá los datos e intentá de nuevo.'
}

// ── Crear ──
export async function createPlaceAction(
  values: PlaceFormValues,
): Promise<{ error: string } | { success: true; placeId: string }> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const parsed = placeSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    const { placeId } = await container.getCreatePlaceUseCase().execute(toWriteInput(parsed.data))
    revalidatePath('/admin/lugares')
    return { success: true, placeId }
  } catch (err) {
    return { error: toErrorMessage(err) }
  }
}

// ── Editar ──
export async function updatePlaceAction(
  placeId: string,
  values: PlaceFormValues,
): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const parsed = placeSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    await container.getUpdatePlaceUseCase().execute(placeId, toWriteInput(parsed.data))
    revalidatePath('/admin/lugares')
    revalidatePath(`/admin/lugares/${placeId}`)
    return { success: true }
  } catch (err) {
    return { error: toErrorMessage(err) }
  }
}

// ── Publicar / Archivar ──
export async function publishPlaceAction(placeId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }
  try {
    await container.getPublishPlaceUseCase().execute(placeId)
    revalidatePath('/admin/lugares')
    return { success: true }
  } catch (err) {
    return { error: toErrorMessage(err) }
  }
}

export async function archivePlaceAction(placeId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }
  try {
    await container.getArchivePlaceUseCase().execute(placeId)
    revalidatePath('/admin/lugares')
    return { success: true }
  } catch (err) {
    return { error: toErrorMessage(err) }
  }
}
