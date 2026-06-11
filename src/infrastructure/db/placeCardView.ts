import { Prisma } from '@prisma/client'
import { PlaceCardView } from '@application/ports/PlaceRepository'

// Select + mapper compartido para PlaceCardView. Lo reúsan los read-models de
// varios repos (Place.findRelated, VisitHistory, Collection curada) y el Search,
// para que la tarjeta se arme igual en todos lados (un solo origen de verdad).
export const placeCardArgs = Prisma.validator<Prisma.PlaceDefaultArgs>()({
  select: {
    id: true,
    slug: true,
    name: true,
    priceRange: true,
    googleRating: true,
    googleReviewCount: true,
    score: true,
    category: { select: { name: true } },
    commune: { select: { name: true } },
    neighborhood: { select: { name: true } },
    // Línea(s) de metro de la estación más cercana (badge en la tarjeta, color oficial).
    metroStation: { select: { lines: { select: { code: true, color: true } } } },
    // Portada: la marcada como principal, o la primera por orden.
    images: {
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      take: 1,
      select: { url: true },
    },
  },
})

export type PlaceCardRow = Prisma.PlaceGetPayload<typeof placeCardArgs>

export function toPlaceCardView(row: PlaceCardRow): PlaceCardView {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryName: row.category.name,
    communeName: row.commune.name,
    neighborhoodName: row.neighborhood?.name ?? undefined,
    priceRange: row.priceRange ?? undefined,
    coverUrl: row.images[0]?.url,
    googleRating: row.googleRating ?? undefined,
    googleReviewCount: row.googleReviewCount ?? undefined,
    metroLines: row.metroStation?.lines.map((l) => ({ code: l.code, color: l.color })),
    score: row.score,
  }
}
