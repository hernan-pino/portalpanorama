'use server'
import { z } from 'zod'
import { revalidateTag } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { CACHE_TAGS } from '@lib/cachedReads'
import { ALLOWED_IMAGE_HOSTS, isAllowedImageUrl } from '@lib/imageHosts'
import { PriceRange } from '@domain/place/PriceRange'
import { ReservationPolicy } from '@domain/place/ReservationPolicy'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { UnauthorizedBusinessAccessError } from '@domain/business/errors/UnauthorizedBusinessAccessError'
import { ImageFetchError } from '@application/ports/ImageFetcher'
import { OWNER_SOCIAL_NETWORKS } from './socialNetworks'

type ActionResult = { error: string } | { success: true }

// z.url() acepta cualquier esquema (javascript:, data:…); estos enlaces van a un
// href en la ficha pública → exigimos http(s) explícito (defensa anti-XSS).
const httpUrl = z
  .string()
  .trim()
  .url('Debe ser un enlace válido.')
  .refine((u) => /^https?:\/\//i.test(u), 'El enlace debe empezar con http:// o https://')

// Redes extra: red de la lista permitida + URL http(s). El form manda el set completo
// como JSON; se descartan las filas sin URL antes de validar.
const socialLinkSchema = z.object({
  network: z.enum(OWNER_SOCIAL_NETWORKS),
  url: httpUrl,
})
const MAX_SOCIAL_LINKS = 8

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
  accessDetail: z.string().trim().max(300).optional(),
  reference: z.string().trim().max(300).optional(),
})

function clean(v: string | undefined): string | undefined {
  return v && v.length > 0 ? v : undefined
}

// Parsea el JSON de redes del form → [{network,url}] validado (siempre un array,
// aunque vacío: así el use case sabe que el dueño gestionó las redes y las fija).
function parseSocialLinksField(
  raw: FormDataEntryValue | null,
): { links: { network: string; url: string }[] } | { error: string } {
  if (typeof raw !== 'string' || raw.trim() === '') return { links: [] }
  let arr: unknown
  try {
    arr = JSON.parse(raw)
  } catch {
    return { error: 'No se pudieron leer las redes sociales.' }
  }
  const rows = (Array.isArray(arr) ? arr : []).filter(
    (x) => x && typeof x === 'object' && typeof (x as { url?: unknown }).url === 'string' && (x as { url: string }).url.trim() !== '',
  )
  const sp = z.array(socialLinkSchema).max(MAX_SOCIAL_LINKS).safeParse(rows)
  if (!sp.success) return { error: sp.error.issues[0]?.message ?? 'Alguna red social es inválida.' }
  return { links: sp.data }
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
    accessDetail: formData.get('accessDetail') || undefined,
    reference: formData.get('reference') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  // Redes extra: llegan como JSON del form. Se descartan las filas sin URL y se
  // valida el resto (red permitida + http(s)). El set completo es la fuente de verdad.
  const socialParsed = parseSocialLinksField(formData.get('socialLinks'))
  if ('error' in socialParsed) return socialParsed

  const d = parsed.data
  try {
    await container.getUpdateOwnedPlaceInfoUseCase().execute(session.user.id, d.slug, {
      description: clean(d.description),
      schedule: clean(d.schedule),
      phone: clean(d.phone),
      website: clean(d.website),
      instagram: clean(d.instagram),
      socialLinks: socialParsed.links,
      menuUrl: clean(d.menuUrl),
      priceRange: (d.priceRange || undefined) as PriceRange | undefined,
      reservation: (d.reservation || undefined) as ReservationPolicy | undefined,
      accessDetail: clean(d.accessDetail),
      reference: clean(d.reference),
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

// ── Fotos del dueño ─────────────────────────────────────────────────────────
// El dueño gestiona sus propias fotos (parte de "editar directo"). El guard de
// ownership se reusa cargando la ficha con GetOwnedPlaceForEdit (lanza si no la
// gestiona), antes de tocar el storage o la BD.

const UPLOAD_ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const UPLOAD_MAX_BYTES = 15 * 1024 * 1024 // 15 MB crudos (foto de teléfono entra holgada)
const MAX_OWNER_IMAGES = 12

async function assertOwnerManages(slug: string): Promise<{ userId: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Inicia sesión para gestionar tus fotos.' }
  try {
    await container.getGetOwnedPlaceForEditUseCase().execute(session.user.id, slug)
    return { userId: session.user.id }
  } catch (err) {
    if (err instanceof UnauthorizedBusinessAccessError) return { error: 'No gestionas esta ficha.' }
    if (err instanceof PlaceNotFoundError) return { error: 'Esta ficha ya no existe.' }
    throw err
  }
}

// Sube un archivo: comprime y rehospeda en nuestro Blob, devuelve la URL lista
// para guardar. No toca la ficha todavía (eso lo hace saveOwnedPlaceImagesAction).
export async function uploadOwnedPlaceImageAction(
  formData: FormData,
): Promise<{ error: string } | { url: string }> {
  const slug = String(formData.get('slug') ?? '')
  const guard = await assertOwnerManages(slug)
  if ('error' in guard) return guard

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'No llegó ningún archivo.' }
  if (!UPLOAD_ALLOWED_MIME.has(file.type)) {
    return { error: 'Formato no permitido. Usa JPG, PNG, WebP o GIF.' }
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return { error: `La imagen supera el límite de ${UPLOAD_MAX_BYTES / 1024 / 1024} MB.` }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await container
      .getUploadPlaceImageUseCase()
      .execute({ buffer, filename: file.name })
    return { url }
  } catch {
    return { error: 'No se pudo subir la imagen. Intenta de nuevo.' }
  }
}

// Trae una imagen desde una URL externa (con guardas anti-SSRF), la comprime y la
// rehospeda en nuestro Blob — así la foto guardada siempre queda en un host permitido.
export async function importOwnedPlaceImageAction(
  slug: string,
  rawUrl: string,
): Promise<{ error: string } | { url: string }> {
  const guard = await assertOwnerManages(slug)
  if ('error' in guard) return guard

  const parsed = z.string().trim().url('Pega una URL válida.').safeParse(rawUrl)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'URL inválida.' }

  try {
    const { url } = await container.getImportImageFromUrlUseCase().execute({ url: parsed.data })
    return { url }
  } catch (err) {
    if (err instanceof ImageFetchError) return { error: err.message }
    return { error: 'No se pudo traer la imagen de esa URL.' }
  }
}

// Persiste el set completo de fotos (orden + portada + alt). Solo acepta URLs de
// host permitido: aunque nacen de nuestro upload/import, un payload manipulado del
// cliente no puede colar un host externo que tumbe la ficha pública (next/image 500).
const ownerImageSchema = z.object({
  url: z.string().trim().refine(isAllowedImageUrl, {
    message: `Cada foto debe venir de un host permitido (${ALLOWED_IMAGE_HOSTS.join(', ')}).`,
  }),
  alt: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().max(200).optional(),
  ),
  isPrimary: z.boolean(),
})

export async function saveOwnedPlaceImagesAction(
  slug: string,
  images: { url: string; alt?: string; isPrimary: boolean }[],
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Inicia sesión para gestionar tus fotos.' }

  const parsed = z.array(ownerImageSchema).max(MAX_OWNER_IMAGES).safeParse(images)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Fotos inválidas.' }

  try {
    await container
      .getUpdateOwnedPlaceImagesUseCase()
      .execute(session.user.id, slug, parsed.data)
  } catch (err) {
    if (err instanceof UnauthorizedBusinessAccessError) return { error: 'No gestionas esta ficha.' }
    if (err instanceof PlaceNotFoundError) return { error: 'Esta ficha ya no existe.' }
    throw err
  }

  revalidateTag(CACHE_TAGS.places)
  return { success: true }
}
