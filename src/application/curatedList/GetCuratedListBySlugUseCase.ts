import { CuratedRule } from '@domain/curatedList/CuratedRule'
import { CuratedListNotFoundError } from '@domain/curatedList/errors/CuratedListNotFoundError'
import {
  CuratedListPageView,
  CuratedListRepository,
} from '../ports/CuratedListRepository'
import { PlaceRepository } from '../ports/PlaceRepository'
import { SearchParams, SearchService } from '../ports/SearchService'

// Landing de catálogo: tope de lugares que se resuelven de la regla. Una guía
// exhaustiva (p. ej. "Museos de Santiago") rara vez pasa de esto; si crece, se
// pagina aparte (post-MVP).
const LANDING_LIMIT = 200

// Lee la landing /lista/[slug]: toma la lista curada, RESUELVE su regla contra el
// buscador (se mantiene completa sola a medida que se carga el catálogo) y antepone
// los destacados fijados a mano con su bajada. Un borrador no existe para el público
// (lanza → la ruta hace notFound()).
export class GetCuratedListBySlugUseCase {
  constructor(
    private readonly listRepo: CuratedListRepository,
    private readonly placeRepo: PlaceRepository,
    private readonly search: SearchService,
  ) {}

  async execute(slug: string): Promise<CuratedListPageView> {
    const list = await this.listRepo.findBySlug(slug)
    if (!list || !list.isPublished) throw new CuratedListNotFoundError(slug)

    // Fijados a mano primero (destacados + menciones), resueltos a tarjeta. Solo
    // publicados: findCardsByIds filtra los archivados, así que un pin caído no rompe
    // la landing. Una sola query trae ambos niveles; luego se reparten por kind.
    const pinnedIds = list.pinnedPlaceIds()
    const pinnedCards = await this.placeRepo.findCardsByIds(pinnedIds)
    const byId = new Map(pinnedCards.map((c) => [c.id, c]))
    const live = list.pins
      .filter((p) => byId.has(p.placeId))
      .sort((a, b) => a.sortOrder - b.sortOrder)
    const pinned = live
      .filter((p) => p.kind === 'FEATURED')
      .map((p) => ({ blurb: p.blurb, place: byId.get(p.placeId)! }))
    const mentions = live
      .filter((p) => p.kind === 'MENTION')
      .map((p) => ({ note: p.blurb, place: byId.get(p.placeId)! }))

    // El resto: la regla resuelta, sin los fijados a mano (ya van arriba).
    const result = await this.search.search({
      ...ruleToSearchParams(list.rule),
      page: 1,
      limit: LANDING_LIMIT,
    })
    const pinnedSet = new Set(pinnedIds)
    const rest = result.items.filter((p) => !pinnedSet.has(p.id))

    return {
      slug: list.slug.value,
      name: list.name,
      kind: list.kind,
      description: list.description,
      intro: list.intro,
      coverImageUrl: list.coverImageUrl,
      pinned,
      mentions,
      rest,
      total: pinned.length + mentions.length + rest.length,
    }
  }
}

// La regla es un subconjunto de los filtros del explorar: el mapeo a SearchParams
// es casi identidad. Explícito a propósito (no spread) para que el día que la regla
// gane un campo se decida a mano si va al buscador.
function ruleToSearchParams(rule: CuratedRule): SearchParams {
  return {
    categorySlug: rule.categorySlug,
    subcategorySlug: rule.subcategorySlug,
    communeSlug: rule.communeSlug,
    neighborhoodSlug: rule.neighborhoodSlug,
    metroLineCode: rule.metroLineCode,
    metroStationSlug: rule.metroStationSlug,
    priceRanges: rule.priceRanges ? [...rule.priceRanges] : undefined,
    socialTagSlugs: rule.socialTagSlugs ? [...rule.socialTagSlugs] : undefined,
    accessTagSlugs: rule.accessTagSlugs ? [...rule.accessTagSlugs] : undefined,
    vibeTagSlugs: rule.vibeTagSlugs ? [...rule.vibeTagSlugs] : undefined,
    occasionTagSlugs: rule.occasionTagSlugs ? [...rule.occasionTagSlugs] : undefined,
    experienceTagSlugs: rule.experienceTagSlugs ? [...rule.experienceTagSlugs] : undefined,
    cuisineTagSlugs: rule.cuisineTagSlugs ? [...rule.cuisineTagSlugs] : undefined,
    walkInOnly: rule.walkInOnly,
  }
}
