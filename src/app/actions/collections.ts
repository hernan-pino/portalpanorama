'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { revalidatePath } from 'next/cache'

// Acciones compartidas de "guardar en una lista" (B.9). Las usan tanto la ficha
// (botón Guardar) como la tarjeta de lugar (corazón) en explorar/home. Transporte
// puro: validan sesión + input y delegan en los use cases.

type ActionResult = { error: string } | { success: true }

// ── Guardar en una lista existente ──
export async function saveToCollectionAction(
  placeId: string,
  collectionId: string,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tenés que iniciar sesión para guardar lugares.' }

  await container.getAddPlaceToCollectionUseCase().execute({
    userId: session.user.id,
    collectionId,
    placeId,
  })

  revalidatePath('/mi-cuenta')
  return { success: true }
}

// ── Crear una lista nueva y guardar el lugar en ella ──
const createListSchema = z.object({
  name: z.string().trim().min(1, 'Ponle un nombre a la lista.').max(60, 'Máximo 60 caracteres.'),
})

export async function createListAndSaveAction(
  placeId: string,
  name: string,
): Promise<{ error: string } | { success: true; collectionId: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tenés que iniciar sesión para guardar lugares.' }

  const parsed = createListSchema.safeParse({ name })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Nombre inválido.' }

  const { collectionId } = await container.getCreateCollectionUseCase().execute({
    ownerId: session.user.id,
    name: parsed.data.name,
  })
  await container.getAddPlaceToCollectionUseCase().execute({
    userId: session.user.id,
    collectionId,
    placeId,
  })

  revalidatePath('/mi-cuenta')
  return { success: true, collectionId }
}
