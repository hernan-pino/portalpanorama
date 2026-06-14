'use server'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { signIn } from '@lib/auth'
import { container } from '@lib/container'
import { rateLimit, clientIp } from '@lib/rateLimit'
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
  // Anti-bots: tope de altas por IP. Best-effort (ver lib/rateLimit).
  const ip = await clientIp()
  if (!rateLimit(`register:${ip}`, 5, 60 * 60_000).ok) {
    return { error: 'Demasiados intentos de registro desde aquí. Probá de nuevo más tarde.' }
  }

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

  // Auto-login: la persona recién creada entra directo, sin pasar por /login.
  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    // La cuenta sí quedó creada; si el auto-login fallara, la mandamos a login a mano.
    if (error instanceof AuthError) redirect('/login?registered=1')
    throw error
  }

  redirect('/mi-cuenta?bienvenida=1')
}
