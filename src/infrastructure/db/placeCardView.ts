import { Prisma, TagLayer } from '@prisma/client'
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
    // Tags de contexto social para la grilla (rediseño s35). Solo las 3 capas que la
    // tarjeta muestra (¿con quién? · ambiente · ocasión) para no engordar la consulta;
    // el mapper elige hasta 2 por prioridad. Sin filtrar por categoría: en la tarjeta
    // no aplican las condicionales (cocina/específicos van en la ficha).
    tags: {
      where: { tag: { layer: { in: [TagLayer.AUDIENCE, TagLayer.VIBE, TagLayer.OCCASION] } } },
      select: { tag: { select: { name: true, layer: true } } },
    },
    // Portada: la marcada como principal, o la primera por orden.
    images: {
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
      take: 1,
      select: { url: true },
    },
  },
})

export type PlaceCardRow = Prisma.PlaceGetPayload<typeof placeCardArgs>

// Prioridad de capa en la tarjeta: primero con quién voy, luego el ambiente, luego
// la ocasión. El organizador decide por contexto social, así que esas mandan.
const CARD_TAG_PRIORITY: Record<string, number> = {
  [TagLayer.AUDIENCE]: 0,
  [TagLayer.VIBE]: 1,
  [TagLayer.OCCASION]: 2,
}

export function toPlaceCardView(row: PlaceCardRow): PlaceCardView {
  // Filtra a las 3 capas de la tarjeta y ordena por prioridad. El filtro se hace acá
  // (no solo en el select) porque findRelated reusa el mapper con un select de tags más
  // amplio (necesita todos los tagId para la afinidad).
  const contextTags = row.tags
    .map((t) => ({ name: t.tag.name, layer: t.tag.layer as string }))
    .filter((t) => t.layer in CARD_TAG_PRIORITY)
    .sort((a, b) => CARD_TAG_PRIORITY[a.layer] - CARD_TAG_PRIORITY[b.layer])
    .slice(0, 2)

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
    contextTags: contextTags.length > 0 ? contextTags : undefined,
    score: row.score,
  }
}
