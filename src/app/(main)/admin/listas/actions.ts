'use server'
import { z } from 'zod'
import { revalidatePath, revalidateTag } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { CACHE_TAGS } from '@lib/cachedReads'
import { ALLOWED_IMAGE_HOSTS, isAllowedImageUrl } from '@lib/imageHosts'
import { DomainError } from '@domain/shared/DomainError'
import { PriceRange } from '@domain/place/PriceRange'
import { ImageFetchError } from '@application/ports/ImageFetcher'
import type { CuratedListWriteInput } from '@application/curatedList/CuratedListWriteInput'
import type { CuratedRule } from '@domain/curatedList/CuratedRule'
import type { CuratedListFormValues } from './types'

// Transporte puro: valida sesión ADMIN + input (Zod) y delega en los use cases.

type ActionResult = { error: string } | { success: true }

async function isAdmin(): Promise<boolean> {
  const session = await auth()
  return Boolean(session?.user) && (session!.user as { role?: string }).role === 'ADMIN'
}

const emptyToUndef = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const optionalText = z.preprocess(emptyToUndef, z.string().trim().optional())
const slugLike = z.preprocess(emptyToUndef, z.string().trim().optional())

const ruleSchema = z.object({
  categorySlug: slugLike,
  subcategorySlug: slugLike,
  communeSlug: slugLike,
  neighborhoodSlug: slugLike,
  metroLineCode: slugLike,
  priceRanges: z.array(z.nativeEnum(PriceRange)).optional().default([]),
  socialTagSlugs: z.array(z.string().trim().min(1)).optional().default([]),
  accessTagSlugs: z.array(z.string().trim().min(1)).optional().default([]),
  vibeTagSlugs: z.array(z.string().trim().min(1)).optional().default([]),
  occasionTagSlugs: z.array(z.string().trim().min(1)).optional().default([]),
  experienceTagSlugs: z.array(z.string().trim().min(1)).optional().default([]),
  cuisineTagSlugs: z.array(z.string().trim().min(1)).optional().default([]),
  walkInOnly: z.boolean().optional().default(false),
})

const pinSchema = z.object({
  placeId: z.string().trim().min(1),
  pinKind: z.enum(['FEATURED', 'MENTION']).optional().default('FEATURED'),
  blurb: optionalText,
})

const listSchema = z.object({
  name: z.string().trim().min(2, 'El nombre de la lista es obligatorio.'),
  kind: z.enum(['GUIDE', 'OCCASION']),
  description: optionalText,
  intro: optionalText,
  // La portada se rehospeda en el Blob (host permitido); una URL de otro host
  // tumbaría next/image, así que se valida la allowlist igual que en Place/Brand.
  coverImageUrl: z.preprocess(
    emptyToUndef,
    z
      .string()
      .trim()
      .url('La portada necesita una URL válida.')
      .refine(isAllowedImageUrl, {
        message: `La portada debe venir de un host permitido (${ALLOWED_IMAGE_HOSTS.join(', ')}).`,
      })
      .optional(),
  ),
  rule: ruleSchema,
  pins: z.array(pinSchema).optional().default([]),
  isPublished: z.boolean().optional().default(false),
})

type ParsedList = z.infer<typeof listSchema>

function toRule(r: ParsedList['rule']): CuratedRule {
  return {
    categorySlug: r.categorySlug,
    subcategorySlug: r.subcategorySlug,
    communeSlug: r.communeSlug,
    neighborhoodSlug: r.neighborhoodSlug,
    metroLineCode: r.metroLineCode,
    priceRanges: r.priceRanges.length ? r.priceRanges : undefined,
    socialTagSlugs: r.socialTagSlugs.length ? r.socialTagSlugs : undefined,
    accessTagSlugs: r.accessTagSlugs.length ? r.accessTagSlugs : undefined,
    vibeTagSlugs: r.vibeTagSlugs.length ? r.vibeTagSlugs : undefined,
    occasionTagSlugs: r.occasionTagSlugs.length ? r.occasionTagSlugs : undefined,
    experienceTagSlugs: r.experienceTagSlugs.length ? r.experienceTagSlugs : undefined,
    cuisineTagSlugs: r.cuisineTagSlugs.length ? r.cuisineTagSlugs : undefined,
    walkInOnly: r.walkInOnly || undefined,
  }
}

function toWriteInput(d: ParsedList): CuratedListWriteInput {
  return {
    name: d.name,
    kind: d.kind,
    description: d.description,
    intro: d.intro,
    coverImageUrl: d.coverImageUrl,
    rule: toRule(d.rule),
    pins: d.pins.map((p) => ({ placeId: p.placeId, pinKind: p.pinKind, blurb: p.blurb })),
    isPublished: d.isPublished,
  }
}

function toErrorMessage(err: unknown): string {
  if (err instanceof DomainError) return err.message
  if (typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002') {
    return 'Ya existe una lista con ese nombre (slug duplicado). Cambia el nombre.'
  }
  return 'No se pudo guardar la lista. Revisa los datos e intenta de nuevo.'
}

// ── Subir / traer portada (reusa el pipeline de imágenes; mismas guardas que Place) ──
const UPLOAD_ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const UPLOAD_MAX_BYTES = 15 * 1024 * 1024

export async function uploadCoverAction(
  formData: FormData,
): Promise<{ error: string } | { url: string }> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

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
    return { error: 'No se pudo subir la portada. Intenta de nuevo.' }
  }
}

export async function importCoverAction(
  rawUrl: string,
): Promise<{ error: string } | { url: string }> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const parsed = z.string().trim().url('Pega una URL válida.').safeParse(rawUrl)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'URL inválida.' }

  try {
    const { url } = await container.getImportImageFromUrlUseCase().execute({ url: parsed.data })
    return { url }
  } catch (err) {
    if (err instanceof ImageFetchError) return { error: err.message }
    return { error: 'No se pudo traer la portada de esa URL.' }
  }
}

// ── Crear ──
export async function createCuratedListAction(
  values: CuratedListFormValues,
): Promise<{ error: string } | { success: true; listId: string }> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const parsed = listSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    const { listId } = await container
      .getCreateCuratedListUseCase()
      .execute(toWriteInput(parsed.data))
    revalidatePath('/admin/listas')
    revalidateTag(CACHE_TAGS.curatedLists)
    return { success: true, listId }
  } catch (err) {
    return { error: toErrorMessage(err) }
  }
}

// ── Editar ──
export async function updateCuratedListAction(
  listId: string,
  values: CuratedListFormValues,
): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const parsed = listSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    await container.getUpdateCuratedListUseCase().execute(listId, toWriteInput(parsed.data))
    revalidatePath('/admin/listas')
    revalidatePath(`/admin/listas/${listId}`)
    revalidateTag(CACHE_TAGS.curatedLists)
    return { success: true }
  } catch (err) {
    return { error: toErrorMessage(err) }
  }
}

// ── Eliminar ──
export async function deleteCuratedListAction(listId: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  try {
    await container.getDeleteCuratedListUseCase().execute(listId)
    revalidatePath('/admin/listas')
    revalidateTag(CACHE_TAGS.curatedLists)
    return { success: true }
  } catch (err) {
    return { error: toErrorMessage(err) }
  }
}
