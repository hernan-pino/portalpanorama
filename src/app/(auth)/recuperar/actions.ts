'use server'
import { z } from 'zod'
import { container } from '@lib/container'
import { siteUrl } from '@lib/siteUrl'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'

const schema = z.object({ email: z.string().email('Email inválido.') })

export interface RequestResetState {
  error?: string
  done?: boolean
}

export async function requestPasswordResetAction(
  _prev: RequestResetState | null,
  formData: FormData,
): Promise<RequestResetState> {
  // Anti-abuso: tope de pedidos por IP (best-effort, ver lib/rateLimit).
  const ip = await clientIp()
  if (!(await rateLimitDurable(`reset-request:${ip}`, 5, 60 * 60_000)).ok) {
    return { error: 'Demasiados pedidos desde aquí. Probá de nuevo más tarde.' }
  }

  const parsed = schema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { error: 'Email inválido.' }

  try {
    await container.getRequestPasswordResetUseCase().execute({
      email: parsed.data.email,
      appBaseUrl: siteUrl,
    })
  } catch (err) {
    // Si el envío de correo falla (p.ej. RESEND_API_KEY ausente), NO lo revelamos:
    // la respuesta es siempre la misma para no filtrar si el email existe.
    console.error('Fallo al procesar el pedido de reset (oculto al usuario):', err)
  }

  // Respuesta genérica siempre (anti-enumeración de cuentas).
  return { done: true }
}
