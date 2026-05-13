'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { revalidatePath } from 'next/cache'
import { DuplicateReviewError } from '@domain/review/errors/DuplicateReviewError'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'

const reviewSchema = z.object({
  listingId: z.string().min(1),
  slug: z.string().min(1),
  rating: z.coerce.number().int().min(1, 'El puntaje mínimo es 1.').max(10, 'El puntaje máximo es 10.'),
  body: z
    .string()
    .min(10, 'La reseña debe tener al menos 10 caracteres.')
    .max(1000, 'La reseña no puede superar los 1000 caracteres.'),
})

export async function submitReviewAction(
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tenés que iniciar sesión para dejar una reseña.' }

  const parsed = reviewSchema.safeParse({
    listingId: formData.get('listingId'),
    slug: formData.get('slug'),
    rating: formData.get('rating'),
    body: formData.get('body'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    await container.getCreateReviewUseCase().execute({
      userId: session.user.id,
      listingId: parsed.data.listingId,
      rating: parsed.data.rating,
      body: parsed.data.body,
    })
  } catch (error) {
    if (error instanceof DuplicateReviewError) return { error: 'Ya dejaste una reseña para este lugar.' }
    if (error instanceof ListingNotFoundError) return { error: 'Lugar no encontrado.' }
    throw error
  }

  revalidatePath(`/lugar/${parsed.data.slug}`)
  return { success: true }
}

export async function toggleFavoriteAction(
  listingId: string,
  slug: string,
  currentlyFavorite: boolean,
): Promise<{ error: string } | { success: true }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tenés que iniciar sesión para guardar lugares.' }

  if (currentlyFavorite) {
    await container.getRemoveFavoriteUseCase().execute({ userId: session.user.id, listingId })
  } else {
    await container.getSaveFavoriteUseCase().execute({ userId: session.user.id, listingId })
  }

  revalidatePath(`/lugar/${slug}`)
  revalidatePath('/mi-cuenta')
  return { success: true }
}
