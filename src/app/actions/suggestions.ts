'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'
import { SuggestionKind } from '@domain/suggestion/SuggestionKind'

type ActionResult = { error: string } | { success: true }

const schema = z.object({
  kind: z.nativeEnum(SuggestionKind),
  message: z
    .string()
    .trim()
    .min(4, 'Cuéntanos un poco más.')
    .max(1000, 'Máximo 1000 caracteres.'),
  email: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().email('Revisa el email.').optional(),
  ),
})

// "Sugerencias" del público (footer). Anónimo-friendly: no exige login ni email.
export async function createSuggestionAction(input: unknown): Promise<ActionResult> {
  // Anti-spam: tope por IP (sin esto un bot inunda el buzón).
  const ip = await clientIp()
  if (!(await rateLimitDurable(`suggestion:${ip}`, 5, 10 * 60_000)).ok) {
    return { error: 'Recibimos varias sugerencias desde aquí. Prueba de nuevo en unos minutos.' }
  }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  const session = await auth()
  await container.getCreateSuggestionUseCase().execute({
    kind: parsed.data.kind,
    message: parsed.data.message,
    email: parsed.data.email,
    userId: session?.user?.id ?? undefined,
  })
  return { success: true }
}
