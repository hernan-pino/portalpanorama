'use server'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { signIn } from '@lib/auth'
import { container } from '@lib/container'
import { safeCallbackUrl } from '@lib/safeCallbackUrl'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'
import { EmailAlreadyInUseError } from '@domain/user/errors/EmailAlreadyInUseError'
import { evaluatePassword } from '@domain/user/PasswordPolicy'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Email inválido.'),
  password: z.string().superRefine((value, ctx) => {
    for (const issue of evaluatePassword(value).issues) {
      ctx.addIssue({ code: 'custom', message: `La contraseña necesita: ${issue.toLowerCase()}.` })
    }
  }),
})

export async function registerAction(
  _prev: { error?: string; fieldErrors?: Record<string, string[]> } | null,
  formData: FormData,
): Promise<{ error?: string; fieldErrors?: Record<string, string[]> }> {
  // Anti-bots: tope de altas por IP. Best-effort (ver lib/rateLimit).
  const ip = await clientIp()
  if (!(await rateLimitDurable(`register:${ip}`, 5, 60 * 60_000)).ok) {
    return { error: 'Demasiados intentos de registro desde aquí. Prueba de nuevo más tarde.' }
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
      return { error: 'Este email ya está registrado. ¿Quieres iniciar sesión?' }
    }
    throw error
  }

  // Destino tras el alta: si venía de un flujo (reclamar ficha), vuelve ahí.
  const callbackUrl = safeCallbackUrl(formData.get('callbackUrl') as string | null, '/mi-cuenta?bienvenida=1')

  // Auto-login: la persona recién creada entra directo, sin pasar por /login.
  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    // La cuenta sí quedó creada; si el auto-login fallara, la mandamos a login a mano
    // preservando el destino para no perder el flujo.
    if (error instanceof AuthError) {
      redirect(`/login?registered=1&callbackUrl=${encodeURIComponent(callbackUrl)}`)
    }
    throw error
  }

  redirect(callbackUrl)
}
