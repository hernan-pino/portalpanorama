'use server'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { rateLimit, clientIp } from '@lib/rateLimit'
import { ReportReason } from '@domain/report/ReportReason'

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
  if (!rateLimit(`report:${ip}`, 5, 10 * 60_000).ok) {
    return { error: 'Recibimos varios reportes desde aquí. Probá de nuevo en unos minutos.' }
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
