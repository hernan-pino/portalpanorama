import { OwnerImageInput, PlaceRepository } from '../ports/PlaceRepository'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { assertManagesPlace } from './assertManagesPlace'

// El dueño verificado gestiona las fotos de SU ficha (edición directa, decisión
// s28). Verifica ownership antes de escribir; solo toca las imágenes. Las URLs ya
// vienen validadas por la action (nacen de nuestro storage: host permitido).
export class UpdateOwnedPlaceImagesUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(userId: string, slug: string, images: OwnerImageInput[]): Promise<string> {
    const place = await this.placeRepo.findOwnerEditableBySlug(slug)
    if (!place) throw new PlaceNotFoundError(slug)
    assertManagesPlace(userId, place)

    await this.placeRepo.updateOwnerImages(place.id, images)
    return place.slug
  }
}
