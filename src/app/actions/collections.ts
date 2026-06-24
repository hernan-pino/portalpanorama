'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { revalidatePath } from 'next/cache'
import { DomainError } from '@domain/shared/DomainError'

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
  if (!session?.user?.id) return { error: 'Tienes que iniciar sesión para guardar lugares.' }

  await container.getAddPlaceToCollectionUseCase().execute({
    userId: session.user.id,
    collectionId,
    placeId,
  })

  revalidatePath('/mi-cuenta')
  return { success: true }
}

// ── Guardar en la lista por defecto ("Favoritos"), creandola si no existe ──
export async function saveToDefaultCollectionAction(
  placeId: string,
): Promise<{ error: string } | { success: true; collectionId: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tienes que iniciar sesión para guardar lugares.' }

  const { collectionId } = await container.getSaveToDefaultCollectionUseCase().execute({
    userId: session.user.id,
    placeId,
  })

  revalidatePath('/mi-cuenta')
  return { success: true, collectionId }
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
  if (!session?.user?.id) return { error: 'Tienes que iniciar sesión para guardar lugares.' }

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

// ── Gestión de una lista desde su vista de detalle (Mi cuenta › Guardados) ──

// Renombrar la lista. El use case valida ownership (anti-IDOR) y lanza si no es suya.
const renameListSchema = z.object({
  name: z.string().trim().min(1, 'Ponle un nombre a la lista.').max(60, 'Máximo 60 caracteres.'),
})

export async function renameListAction(
  collectionId: string,
  name: string,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tienes que iniciar sesión.' }

  const parsed = renameListSchema.safeParse({ name })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Nombre inválido.' }

  try {
    await container.getRenameCollectionUseCase().execute({
      userId: session.user.id,
      collectionId,
      name: parsed.data.name,
    })
  } catch (e) {
    if (e instanceof DomainError) return { error: 'No se pudo renombrar la lista.' }
    throw e
  }

  revalidatePath('/mi-cuenta')
  return { success: true }
}

// Eliminar la lista completa (con sus items, por Cascade).
export async function deleteListAction(collectionId: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tienes que iniciar sesión.' }

  try {
    await container.getDeleteCollectionUseCase().execute({
      userId: session.user.id,
      collectionId,
    })
  } catch (e) {
    if (e instanceof DomainError) return { error: 'No se pudo eliminar la lista.' }
    throw e
  }

  revalidatePath('/mi-cuenta')
  return { success: true }
}

// Quitar un lugar de ESTA lista (sigue guardado en otras listas donde esté).
export async function removeFromListAction(
  collectionId: string,
  placeId: string,
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tienes que iniciar sesión.' }

  try {
    await container.getRemovePlaceFromCollectionUseCase().execute({
      userId: session.user.id,
      collectionId,
      placeId,
    })
  } catch (e) {
    if (e instanceof DomainError) return { error: 'No se pudo quitar el lugar.' }
    throw e
  }

  revalidatePath('/mi-cuenta')
  return { success: true }
}
