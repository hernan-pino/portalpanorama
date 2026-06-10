import { CollectionNotFoundError } from '@domain/collection/errors/CollectionNotFoundError'
import { CollectionRepository } from '../ports/CollectionRepository'

export interface AddPlaceToCollectionInput {
  userId: string
  collectionId: string
  placeId: string
}

// "Guardar en lista" (B.9). Idempotente: el dominio no duplica el lugar.
export class AddPlaceToCollectionUseCase {
  constructor(private readonly collectionRepo: CollectionRepository) {}

  async execute(input: AddPlaceToCollectionInput): Promise<void> {
    const collection = await this.collectionRepo.findById(input.collectionId)
    if (!collection) throw new CollectionNotFoundError(input.collectionId)
    collection.assertOwnership(input.userId)
    await this.collectionRepo.save(collection.addPlace(input.placeId))
  }
}
