'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { revalidatePath } from 'next/cache'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { InvalidCurrentPasswordError } from '@domain/user/errors/InvalidCurrentPasswordError'
import { NoPasswordSetError } from '@domain/user/errors/NoPasswordSetError'
import { evaluatePassword } from '@domain/user/PasswordPolicy'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
})

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual.'),
    newPassword: z.string().superRefine((value, ctx) => {
      for (const issue of evaluatePassword(value).issues) {
        ctx.addIssue({ code: 'custom', message: `La nueva contraseña necesita: ${issue.toLowerCase()}.` })
      }
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'La nueva contraseña debe ser distinta de la actual.',
    path: ['newPassword'],
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

export async function changePasswordAction(
  formData: FormData,
): Promise<{ error: string } | { success: true }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    await container.getChangePasswordUseCase().execute({
      userId: session.user.id,
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    })
  } catch (error) {
    if (error instanceof InvalidCurrentPasswordError) return { error: 'La contraseña actual no es correcta.' }
    if (error instanceof NoPasswordSetError) {
      return { error: 'Tu cuenta ingresa con Google y no tiene contraseña. Usá "¿Olvidaste tu contraseña?" desde el login para crear una.' }
    }
    if (error instanceof UserNotFoundError) return { error: 'Sesión inválida. Por favor volvé a iniciar sesión.' }
    throw error
  }

  return { success: true }
}
