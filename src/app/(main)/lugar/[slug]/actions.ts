'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { revalidatePath } from 'next/cache'
import { ReportReason } from '@domain/report/ReportReason'

type ActionResult = { error: string } | { success: true }

// ── Guardar en una lista existente (B.9) ──
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

// ── Reportar dato incorrecto / lugar cerrado (frescura colaborativa) ──
const reportSchema = z.object({
  placeId: z.string().min(1),
  reason: z.nativeEnum(ReportReason),
  message: z.string().trim().max(500, 'Máximo 500 caracteres.').optional(),
})

export async function reportPlaceAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()

  const parsed = reportSchema.safeParse({
    placeId: formData.get('placeId'),
    reason: formData.get('reason'),
    message: formData.get('message') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  // Visitante anónimo o usuario: ambos pueden reportar (matriz de permisos).
  await container.getCreateReportUseCase().execute({
    placeId: parsed.data.placeId,
    userId: session?.user?.id ?? undefined,
    reason: parsed.data.reason,
    message: parsed.data.message,
  })

  return { success: true }
}
