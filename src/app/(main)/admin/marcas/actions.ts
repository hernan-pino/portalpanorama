'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { ALLOWED_IMAGE_HOSTS, isAllowedImageUrl } from '@lib/imageHosts'
import { DomainError } from '@domain/shared/DomainError'
import { ImageFetchError } from '@application/ports/ImageFetcher'
import type { BrandWriteInput } from '@application/brand/BrandWriteInput'
import type { BrandFormValues } from './types'

// Transporte puro: valida sesión ADMIN + input (Zod) y delega en los use cases.

type ActionResult = { error: string } | { success: true }

async function isAdmin(): Promise<boolean> {
  const session = await auth()
  return Boolean(session?.user) && (session!.user as { role?: string }).role === 'ADMIN'
}

const emptyToUndef = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const optionalText = z.preprocess(emptyToUndef, z.string().trim().optional())
const optionalUrl = z.preprocess(emptyToUndef, z.string().trim().url('URL inválida.').optional())

const socialLinkSchema = z.object({
  network: z.string().trim().min(1, 'Elige la red social.'),
  url: z.string().trim().url('Cada red necesita una URL válida.'),
})

const brandSchema = z.object({
  name: z.string().trim().min(2, 'El nombre de la marca es obligatorio.'),
  // El logo se rehospeda en el Blob (host permitido); una URL de otro host tumbaría
  // el render de next/image, así que se valida la allowlist igual que en Place.
  logoUrl: z.preprocess(
    emptyToUndef,
    z
      .string()
      .trim()
      .url('El logo necesita una URL válida.')
      .refine(isAllowedImageUrl, {
        message: `El logo debe venir de un host permitido (${ALLOWED_IMAGE_HOSTS.join(', ')}).`,
      })
      .optional(),
  ),
  description: optionalText,
  website: optionalUrl,
  instagram: optionalText,
  socialLinks: z.array(socialLinkSchema).optional().default([]),
})

type ParsedBrand = z.infer<typeof brandSchema>

function toWriteInput(d: ParsedBrand): BrandWriteInput {
  return {
    name: d.name,
    logoUrl: d.logoUrl,
    description: d.description,
    website: d.website,
    instagram: d.instagram,
    socialLinks: d.socialLinks,
  }
}

function toErrorMessage(err: unknown): string {
  if (err instanceof DomainError) return err.message
  if (typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002') {
    return 'Ya existe una marca con ese nombre (slug duplicado). Cambia el nombre.'
  }
  return 'No se pudo guardar la marca. Revisa los datos e intenta de nuevo.'
}

// ── Subir / traer logo (reusa el pipeline de imágenes; mismas guardas que Place) ──
const UPLOAD_ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const UPLOAD_MAX_BYTES = 15 * 1024 * 1024

export async function uploadBrandLogoAction(
  formData: FormData,
): Promise<{ error: string } | { url: string }> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'No llegó ningún archivo.' }
  if (!UPLOAD_ALLOWED_MIME.has(file.type)) {
    return { error: 'Formato no permitido. Usá JPG, PNG, WebP o GIF.' }
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
    return { error: 'No se pudo subir el logo. Intenta de nuevo.' }
  }
}

export async function importBrandLogoAction(
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
    return { error: 'No se pudo traer el logo de esa URL.' }
  }
}

// ── Crear ──
export async function createBrandAction(
  values: BrandFormValues,
): Promise<{ error: string } | { success: true; brandId: string }> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const parsed = brandSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    const { brandId } = await container.getCreateBrandUseCase().execute(toWriteInput(parsed.data))
    revalidatePath('/admin/marcas')
    return { success: true, brandId }
  } catch (err) {
    return { error: toErrorMessage(err) }
  }
}

// ── Editar ──
export async function updateBrandAction(
  brandId: string,
  values: BrandFormValues,
): Promise<ActionResult> {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const parsed = brandSchema.safeParse(values)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    await container.getUpdateBrandUseCase().execute(brandId, toWriteInput(parsed.data))
    revalidatePath('/admin/marcas')
    revalidatePath(`/admin/marcas/${brandId}`)
    return { success: true }
  } catch (err) {
    return { error: toErrorMessage(err) }
  }
}
