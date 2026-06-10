import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import { PlaceCardView } from '@application/ports/PlaceRepository'
import { VisitHistoryRepository } from '@application/ports/VisitHistoryRepository'
import { placeCardArgs, toPlaceCardView } from './placeCardView'

// Ventana de dedup: no se registra una segunda visita al mismo lugar dentro de
// este lapso (evita inflar el historial al recargar la ficha). Combustible IA: lo
// que importa es "el usuario estuvo aquí", no cada page-view.
const DEDUP_WINDOW_MS = 6 * 60 * 60 * 1000 // 6 horas

export class PrismaVisitHistoryRepository implements VisitHistoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async record(userId: string, placeId: string): Promise<void> {
    const since = new Date(Date.now() - DEDUP_WINDOW_MS)
    const recent = await this.prisma.visitHistory.findFirst({
      where: { userId, placeId, visitedAt: { gte: since } },
      select: { id: true },
    })
    if (recent) return

    await this.prisma.visitHistory.create({
      data: { id: createId(), userId, placeId },
    })
  }

  async findRecentByUserId(userId: string, limit: number): Promise<PlaceCardView[]> {
    // Un lugar puede haberse visitado varias veces; se muestra una sola vez con su
    // visita más reciente. Se agrupa por placeId tomando el visitedAt máximo.
    const grouped = await this.prisma.visitHistory.groupBy({
      by: ['placeId'],
      where: { userId },
      _max: { visitedAt: true },
      orderBy: { _max: { visitedAt: 'desc' } },
      take: limit,
    })
    if (grouped.length === 0) return []

    const placeIds = grouped.map((g) => g.placeId)
    const places = await this.prisma.place.findMany({
      where: { id: { in: placeIds } },
      ...placeCardArgs,
    })

    // Reordena según el orden de la agrupación (findMany no garantiza orden).
    const byId = new Map(places.map((p) => [p.id, p]))
    return placeIds
      .map((id) => byId.get(id))
      .filter((p): p is NonNullable<typeof p> => p != null)
      .map(toPlaceCardView)
  }
}
