'use server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { container } from '@lib/container'
import { EmailAlreadyInUseError } from '@domain/user/errors/EmailAlreadyInUseError'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Email inválido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
})

export async function registerAction(
  _prev: { error?: string; fieldErrors?: Record<string, string[]> } | null,
  formData: FormData,
): Promise<{ error?: string; fieldErrors?: Record<string, string[]> }> {
  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  try {
    await container.getRegisterUserUseCase().execute(parsed.data)
  } catch (error) {
    if (error instanceof EmailAlreadyInUseError) {
      return { error: 'Este email ya está registrado. ¿Querés iniciar sesión?' }
    }
    throw error
  }

  redirect('/login?registered=1')
}
