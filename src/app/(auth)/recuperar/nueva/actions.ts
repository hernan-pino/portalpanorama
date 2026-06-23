'use server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { container } from '@lib/container'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'
import { evaluatePassword } from '@domain/user/PasswordPolicy'
import { InvalidResetTokenError } from '@domain/user/errors/InvalidResetTokenError'

const schema = z.object({
  token: z.string().min(1),
  password: z.string().superRefine((value, ctx) => {
    for (const issue of evaluatePassword(value).issues) {
      ctx.addIssue({ code: 'custom', message: `La contraseña necesita: ${issue.toLowerCase()}.` })
    }
  }),
})

export interface ResetPasswordState {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function resetPasswordAction(
  _prev: ResetPasswordState | null,
  formData: FormData,
): Promise<ResetPasswordState> {
  const ip = await clientIp()
  if (!(await rateLimitDurable(`reset-confirm:${ip}`, 10, 60 * 60_000)).ok) {
    return { error: 'Demasiados intentos desde aquí. Probá de nuevo más tarde.' }
  }

  const parsed = schema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  try {
    await container.getResetPasswordUseCase().execute({
      rawToken: parsed.data.token,
      newPassword: parsed.data.password,
    })
  } catch (err) {
    if (err instanceof InvalidResetTokenError) {
      return { error: 'El enlace es inválido o expiró. Pedí uno nuevo desde "Recuperar contraseña".' }
    }
    throw err
  }

  redirect('/login?reset=1')
}
