'use server'
import { revalidatePath } from 'next/cache'
import { auth } from '@lib/auth'
import { container } from '@lib/container'

export async function removeFavoriteAction(listingId: string): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  await container.getRemoveFavoriteUseCase().execute({
    userId: session.user.id,
    listingId,
  })

  revalidatePath('/mi-cuenta/favoritos')
}
