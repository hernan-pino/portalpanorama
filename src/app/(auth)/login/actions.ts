'use server'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import { signIn } from '@lib/auth'
import { safeCallbackUrl } from '@lib/safeCallbackUrl'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error: string }> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Email o contraseña inválidos.' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Email o contraseña incorrectos.' }
    }
    throw error
  }

  // Si venía de un flujo (ej. reclamar ficha), vuelve ahí; si no, a /explorar.
  redirect(safeCallbackUrl(formData.get('callbackUrl') as string | null, '/explorar?ingreso=1'))
}
