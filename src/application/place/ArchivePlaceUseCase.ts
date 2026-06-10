import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceRepository } from '../ports/PlaceRepository'

// Admin archiva una ficha (reemplaza al borrado: preserva historial). Cualquier
// estado → ARCHIVED.
export class ArchivePlaceUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(placeId: string): Promise<void> {
    const place = await this.placeRepo.findById(placeId)
    if (!place) throw new PlaceNotFoundError(placeId)
    await this.placeRepo.save(place.archive())
  }
}
