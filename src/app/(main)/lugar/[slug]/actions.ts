'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { rateLimitDurable, clientIp } from '@lib/rateLimit'
import { ReportReason } from '@domain/report/ReportReason'
import { PlaceClickKind } from '@domain/place/PlaceClickKind'

// Las acciones de guardar en lista viven en @/app/actions/collections (compartidas
// con la tarjeta de lugar; SaveButton las importa de ahí). Un archivo "use server"
// solo puede exportar funciones async, así que acá NO se re-exportan. Queda solo lo
// propio de la ficha: el reporte.

type ActionResult = { error: string } | { success: true }

// ── Reportar dato incorrecto / lugar cerrado (frescura colaborativa) ──
const reportSchema = z.object({
  placeId: z.string().min(1),
  reason: z.nativeEnum(ReportReason),
  message: z.string().trim().max(500, 'Máximo 500 caracteres.').optional(),
})

export async function reportPlaceAction(formData: FormData): Promise<ActionResult> {
  const session = await auth()

  // Anti-spam: tope por IP (el reporte es anónimo-friendly, sin esto un bot inunda la cola).
  const ip = await clientIp()
  if (!(await rateLimitDurable(`report:${ip}`, 5, 10 * 60_000)).ok) {
    return { error: 'Recibimos varios reportes desde aquí. Prueba de nuevo en unos minutos.' }
  }

  const parsed = reportSchema.safeParse({
    placeId: formData.get('placeId'),
    reason: formData.get('reason'),
    message: formData.get('message') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos.' }

  // Visitante anónimo o usuario: ambos pueden reportar (matriz de permisos).
  await container.getCreateReportUseCase().execute({
    placeId: parsed.data.placeId,
    userId: session?.user?.id ?? undefined,
    reason: parsed.data.reason,
    message: parsed.data.message,
  })

  return { success: true }
}

// ── Clic de contacto (métrica del panel del dueño) ──
// Cómo llegar / web / Instagram / teléfono / carta / otra red. Anónimo.
//
// Fire-and-forget: el <a> navega igual, así que esto NUNCA lanza — un fallo de
// telemetría no puede romperle la navegación a nadie. El rate limit evita inflar
// los conteos a mano: el dueño ve estos números, tienen que ser creíbles.
const clickSchema = z.object({
  placeId: z.string().min(1).max(40),
  kind: z.nativeEnum(PlaceClickKind),
})

export async function recordPlaceClickAction(placeId: string, kind: string): Promise<void> {
  try {
    const parsed = clickSchema.safeParse({ placeId, kind })
    if (!parsed.success) return

    const ip = await clientIp()
    if (!(await rateLimitDurable(`click:${ip}`, 40, 60 * 60_000)).ok) return

    await container.getRecordPlaceClickUseCase().execute(parsed.data.placeId, parsed.data.kind)
  } catch {
    // Silencio a propósito: es telemetría.
  }
}
