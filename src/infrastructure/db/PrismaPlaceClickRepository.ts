import { $Enums, PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import { PlaceClickKind } from '@domain/place/PlaceClickKind'
import {
  EMPTY_CLICK_COUNTS,
  PlaceClickCounts,
  PlaceClickRepository,
} from '@application/ports/PlaceClickRepository'

// Mapea el tipo de dominio a la columna por nombre del conteo desglosado.
const FIELD_BY_KIND: Record<PlaceClickKind, keyof Omit<PlaceClickCounts, 'total'>> = {
  [PlaceClickKind.DIRECTIONS]: 'directions',
  [PlaceClickKind.WEBSITE]: 'website',
  [PlaceClickKind.INSTAGRAM]: 'instagram',
  [PlaceClickKind.PHONE]: 'phone',
  [PlaceClickKind.MENU]: 'menu',
  [PlaceClickKind.SOCIAL]: 'social',
}

export class PrismaPlaceClickRepository implements PlaceClickRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async record(placeId: string, kind: PlaceClickKind): Promise<void> {
    await this.prisma.placeClick.create({
      data: { id: createId(), placeId, type: kind as $Enums.PlaceClickType },
    })
  }

  // Un solo groupBy para todos los lugares del panel (no N queries por ficha).
  async countsByPlaceIds(placeIds: string[]): Promise<Map<string, PlaceClickCounts>> {
    const out = new Map<string, PlaceClickCounts>()
    if (placeIds.length === 0) return out

    const rows = await this.prisma.placeClick.groupBy({
      by: ['placeId', 'type'],
      where: { placeId: { in: placeIds } },
      _count: { _all: true },
    })

    for (const r of rows) {
      const counts = out.get(r.placeId) ?? { ...EMPTY_CLICK_COUNTS }
      const field = FIELD_BY_KIND[r.type as PlaceClickKind]
      const n = r._count._all
      counts[field] += n
      counts.total += n
      out.set(r.placeId, counts)
    }
    return out
  }
}
