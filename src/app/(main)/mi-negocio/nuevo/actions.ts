'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'
import { PlaceAlreadyExistsError } from '@domain/place/errors/PlaceAlreadyExistsError'
import { PlaceCategoryMismatchError } from '@domain/place/errors/PlaceCategoryMismatchError'
import { InvalidCommuneError } from '@domain/place/errors/InvalidCommuneError'

// `duplicate` deja que el form ofrezca la salida correcta (buscar y reclamar la
// ficha existente) en vez de dejar al dueño estancado en un error.
type ActionResult = { error: string; duplicate?: boolean } | { success: true }

const ROLES = ['Dueño/a', 'Representante legal', 'Encargado/a o administrador/a'] as const

const seedSchema = z
  .object({
    name: z.string().trim().min(2, 'Escribe el nombre de tu negocio.').max(120, 'Máximo 120 caracteres.'),
    address: z.string().trim().min(4, 'Escribe la dirección (calle y número).').max(200, 'Máximo 200 caracteres.'),
    communeId: z.string().min(1, 'Elige la comuna.'),
    categoryId: z.string().min(1, 'Elige la categoría.'),
    subcategoryId: z.string().min(1, 'Elige el rubro.'),
    role: z.enum(ROLES),
    phone: z.string().trim().max(40, 'Máximo 40 caracteres.').optional(),
    instagram: z.string().trim().max(120, 'Máximo 120 caracteres.').optional(),
  })
  // Sin un canal de contacto no podemos verificar que el negocio es suyo.
  .refine((d) => !!d.phone || !!d.instagram, {
    message: 'Déjanos un teléfono o un Instagram para poder verificar tu negocio.',
    path: ['phone'],
  })

export async function createOwnedPlaceSeedAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return { error: 'Inicia sesión para publicar tu negocio.' }
  }

  // Anti-spam en dos ejes: la IP corta el bot de turno; la cuenta corta al que rota
  // de IP para inundar la cola de revisión (que se revisa a mano, una por una).
  const ip = await clientIp()
  const [byIp, byUser] = await Promise.all([
    rateLimitDurable(`seed:ip:${ip}`, 3, 60 * 60_000),
    rateLimitDurable(`seed:user:${session.user.id}`, 5, 24 * 60 * 60_000),
  ])
  if (!byIp.ok || !byUser.ok) {
    return { error: 'Recibimos varias fichas tuyas hace poco. Prueba de nuevo más tarde o escríbenos a hola@portalpanorama.cl.' }
  }

  const parsed = seedSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address'),
    communeId: formData.get('communeId'),
    categoryId: formData.get('categoryId'),
    subcategoryId: formData.get('subcategoryId'),
    role: formData.get('role'),
    phone: formData.get('phone') || undefined,
    instagram: formData.get('instagram') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    await container.getCreateOwnedPlaceSeedUseCase().execute({
      submitterId: session.user.id,
      submitterName: session.user.name ?? 'Hola',
      submitterEmail: session.user.email,
      ...parsed.data,
    })
  } catch (err) {
    if (err instanceof PlaceAlreadyExistsError) {
      return {
        error: 'Ya hay una ficha con ese nombre en Portal Panorama. Búscala y reclámala: queda asociada a tu cuenta sin perder lo que ya tiene.',
        duplicate: true,
      }
    }
    // El rubro no calza con la categoría, o la comuna no existe: el form no permite
    // ninguna de las dos, así que si llegan hasta acá es un payload manipulado.
    if (err instanceof PlaceCategoryMismatchError) {
      return { error: 'El rubro no corresponde a la categoría elegida.' }
    }
    if (err instanceof InvalidCommuneError) {
      return { error: 'Esa comuna no está en nuestro catálogo.' }
    }
    throw err
  }

  return { success: true }
}
