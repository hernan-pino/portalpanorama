'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { revalidatePath } from 'next/cache'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
})

export async function updateProfileAction(
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  const parsed = schema.safeParse({
    name: formData.get('name'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    await container.getUpdateUserProfileUseCase().execute({
      userId: session.user.id,
      name: parsed.data.name,
    })
  } catch (error) {
    if (error instanceof UserNotFoundError) return { error: 'Sesión inválida. Por favor volvé a iniciar sesión.' }
    throw error
  }

  revalidatePath('/mi-cuenta')
  return { success: true }
}
