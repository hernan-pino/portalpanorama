import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceRepository } from '../ports/PlaceRepository'

// Admin publica una ficha (PENDING_REVIEW | ARCHIVED → PUBLISHED).
export class PublishPlaceUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(placeId: string): Promise<void> {
    const place = await this.placeRepo.findById(placeId)
    if (!place) throw new PlaceNotFoundError(placeId)
    await this.placeRepo.save(place.publish())
  }
}
