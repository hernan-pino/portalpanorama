import { OwnerEditableFields, PlaceRepository } from '../ports/PlaceRepository'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { assertManagesPlace } from './assertManagesPlace'

// El dueño verificado edita los campos operacionales de SU ficha (edición directa,
// decisión s28). Verifica ownership antes de escribir; solo toca campos seguros.
export class UpdateOwnedPlaceInfoUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(userId: string, slug: string, fields: OwnerEditableFields): Promise<string> {
    const place = await this.placeRepo.findOwnerEditableBySlug(slug)
    if (!place) throw new PlaceNotFoundError(slug)
    assertManagesPlace(userId, place)

    await this.placeRepo.updateOwnerEditableFields(place.id, fields)
    return place.slug
  }
}
