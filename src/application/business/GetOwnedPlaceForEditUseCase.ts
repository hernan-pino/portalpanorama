import { OwnerEditablePlaceView, PlaceRepository } from '../ports/PlaceRepository'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { assertManagesPlace } from './assertManagesPlace'

// Carga la ficha para el form de edición del dueño, verificando que la gestiona.
export class GetOwnedPlaceForEditUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(userId: string, slug: string): Promise<OwnerEditablePlaceView> {
    const place = await this.placeRepo.findOwnerEditableBySlug(slug)
    if (!place) throw new PlaceNotFoundError(slug)
    assertManagesPlace(userId, place)
    return place
  }
}
