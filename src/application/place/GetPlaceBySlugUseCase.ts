import { PlaceCardView, PlaceDetailView, PlaceRepository } from '../ports/PlaceRepository'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'

export interface PlaceDetailOutput {
  place: PlaceDetailView
  related: PlaceCardView[]
}

// Ficha de lugar: detalle denormalizado + bloque "relacionados" (sin IA:
// similitud por tags + categoría + comuna, decisión D.6).
export class GetPlaceBySlugUseCase {
  private static readonly RELATED_LIMIT = 6

  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(slug: string): Promise<PlaceDetailOutput> {
    const place = await this.placeRepo.getDetailBySlug(slug)
    if (!place) throw new PlaceNotFoundError(slug)

    const related = await this.placeRepo.findRelated(
      place.id,
      GetPlaceBySlugUseCase.RELATED_LIMIT,
    )
    return { place, related }
  }
}
