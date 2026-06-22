import { Score } from '@domain/place/Score'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceRepository } from '../ports/PlaceRepository'
import { LocationRepository } from '../ports/LocationRepository'
import { PlaceRatingProvider, RatingResult } from '../ports/PlaceRatingProvider'

export interface EnrichPlaceRatingInput {
  placeId: string
  // Re-consultar aunque ya tenga googlePlaceId (refrescar rating). Si hay place_id
  // guardado, la búsqueda es exacta por ese id (sin matching difuso).
  force?: boolean
  // Resuelve y calcula todo pero NO persiste (previsualizar el match antes de escribir).
  dryRun?: boolean
}

// Resultado discriminado para que el caller (script) decida qué loguear/verificar.
export type EnrichPlaceRatingResult =
  | {
      status: 'updated'
      result: RatingResult
      nameMatch: boolean
      score: number
      // true si se tomaron las coords de Google porque la ficha no tenía (las curadas
      // a mano nunca se pisan); false si ya tenía coords o Google no las trajo.
      coordsSet: boolean
    }
  | { status: 'skipped'; reason: 'already-has-rating' }
  | { status: 'not-found' }

// Enriquece un Place con su reputación de Google (rating, nº de reseñas, place_id)
// traída por un PlaceRatingProvider, y recalcula su score bayesiano (2.5). NO toca
// el estado de la ficha ni publica: el control humano vive en el admin. El matching
// por nombre lo verifica el humano con `nameMatch` + `result.matchedName/Address`.
export class EnrichPlaceRatingUseCase {
  constructor(
    private readonly placeRepo: PlaceRepository,
    private readonly locationRepo: LocationRepository,
    private readonly ratingProvider: PlaceRatingProvider,
  ) {}

  async execute(input: EnrichPlaceRatingInput): Promise<EnrichPlaceRatingResult> {
    const place = await this.placeRepo.findById(input.placeId)
    if (!place) throw new PlaceNotFoundError(input.placeId)

    if (place.googlePlaceId && !input.force) {
      return { status: 'skipped', reason: 'already-has-rating' }
    }

    const communes = await this.locationRepo.listCommunes()
    const communeName = communes.find((c) => c.id === place.communeId)?.name

    const result = await this.ratingProvider.lookup({
      name: place.name,
      address: place.address,
      commune: communeName,
      knownPlaceId: place.googlePlaceId,
    })
    if (!result) return { status: 'not-found' }

    let enriched = place.withReputation({
      googlePlaceId: result.googlePlaceId,
      googleRating: result.googleRating,
      googleReviewCount: result.googleReviewCount,
    })

    // Coords: solo si la ficha NO las tiene (no pisamos las curadas a mano) y Google
    // las trajo. El "Cómo llegar" usa place_id, pero esto habilita pin/mapa a futuro.
    const coordsSet =
      !place.hasCoordinates() &&
      typeof result.latitude === 'number' &&
      typeof result.longitude === 'number'
    if (coordsSet) {
      enriched = enriched.withCoordinates(result.latitude!, result.longitude!)
    }

    // Re-bate el score con el promedio global actual (prior C del bayesiano).
    const globalAverage = await this.placeRepo.globalAverageRating()
    const score = Score.bayesian(enriched.googleRating, enriched.googleReviewCount, globalAverage)
    if (!input.dryRun) {
      await this.placeRepo.save(enriched.withScore(score))
    }

    return {
      status: 'updated',
      result,
      nameMatch: isLikelyMatch(place.name, result.matchedName),
      score,
      coordsSet,
    }
  }
}

// Heurística simple para señalar al humano si el local que devolvió Google se parece
// al que buscábamos (cadenas / nombres ambiguos). No bloquea: solo informa.
function isLikelyMatch(query: string, matched?: string): boolean {
  if (!matched) return false
  const a = normalize(query)
  const b = normalize(matched)
  if (!a || !b) return false
  if (a === b || a.includes(b) || b.includes(a)) return true
  // Solapamiento de tokens significativos (>2 chars).
  const at = new Set(a.split(' ').filter((t) => t.length > 2))
  const bt = b.split(' ').filter((t) => t.length > 2)
  const shared = bt.filter((t) => at.has(t)).length
  return shared >= Math.max(1, Math.ceil(at.size / 2))
}

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
