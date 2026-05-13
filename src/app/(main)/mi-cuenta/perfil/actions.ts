'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { revalidatePath } from 'next/cache'
import { InvalidRUTError } from '@domain/shared/RUT'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  rut: z
    .string()
    .regex(/^[\d.\-kK]+$/, 'El RUT solo puede contener números, puntos y guión.')
    .min(8, 'RUT demasiado corto.')
    .max(12)
    .optional()
    .or(z.literal('').transform(() => undefined)),
})

export async function updateProfileAction(
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  const parsed = schema.safeParse({
    name: formData.get('name'),
    rut: formData.get('rut') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    await container.getUpdateUserProfileUseCase().execute({
      userId: session.user.id,
      name: parsed.data.name,
      rut: parsed.data.rut,
    })
  } catch (error) {
    if (error instanceof InvalidRUTError) return { error: error.message }
    if (error instanceof UserNotFoundError) return { error: 'Sesión inválida. Por favor volvé a iniciar sesión.' }
    throw error
  }

  revalidatePath('/mi-cuenta')
  return { success: true }
}
