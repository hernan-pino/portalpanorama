'use server'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { signIn } from '@lib/auth'
import { container } from '@lib/container'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'
import { EmailAlreadyInUseError } from '@domain/user/errors/EmailAlreadyInUseError'
import { evaluatePassword } from '@domain/user/PasswordPolicy'

// Gemelas de las actions de /registro y /login, con UNA diferencia: no redirigen.
// El wizard de "Publica tu negocio" avanza al paso siguiente en la misma página, así
// que la cuenta se crea (o se inicia sesión) y se devuelve el resultado al cliente.
export type AccountResult = { error: string } | { success: true }

const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().trim().email('Email inválido.'),
  password: z.string().superRefine((value, ctx) => {
    for (const issue of evaluatePassword(value).issues) {
      ctx.addIssue({ code: 'custom', message: `La contraseña necesita: ${issue.toLowerCase()}.` })
    }
  }),
})

export async function registerInlineAction(formData: FormData): Promise<AccountResult> {
  const ip = await clientIp()
  if (!(await rateLimitDurable(`register:${ip}`, 5, 60 * 60_000)).ok) {
    return { error: 'Demasiados intentos de registro desde aquí. Prueba de nuevo más tarde.' }
  }

  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  try {
    await container.getRegisterUserUseCase().execute(parsed.data)
  } catch (error) {
    if (error instanceof EmailAlreadyInUseError) {
      return { error: 'Este email ya está registrado. Inicia sesión para continuar.' }
    }
    throw error
  }

  return signInWithPassword(parsed.data.email, parsed.data.password)
}

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

export async function loginInlineAction(formData: FormData): Promise<AccountResult> {
  const ip = await clientIp()
  if (!(await rateLimitDurable(`login-inline:${ip}`, 10, 60 * 60_000)).ok) {
    return { error: 'Demasiados intentos desde aquí. Prueba de nuevo más tarde.' }
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  return signInWithPassword(parsed.data.email, parsed.data.password)
}

// `redirect: false` deja la sesión creada (la cookie viaja en la respuesta) sin sacar
// al usuario del wizard.
async function signInWithPassword(email: string, password: string): Promise<AccountResult> {
  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    if (error instanceof AuthError) return { error: 'Email o contraseña incorrectos.' }
    throw error
  }
  return { success: true }
}
