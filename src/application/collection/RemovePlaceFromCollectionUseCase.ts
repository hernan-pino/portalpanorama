import { CollectionNotFoundError } from '@domain/collection/errors/CollectionNotFoundError'
import { CollectionRepository } from '../ports/CollectionRepository'

export interface RemovePlaceFromCollectionInput {
  userId: string
  collectionId: string
  placeId: string
}

export class RemovePlaceFromCollectionUseCase {
  constructor(private readonly collectionRepo: CollectionRepository) {}

  async execute(input: RemovePlaceFromCollectionInput): Promise<void> {
    const collection = await this.collectionRepo.findById(input.collectionId)
    if (!collection) throw new CollectionNotFoundError(input.collectionId)
    collection.assertOwnership(input.userId)
    await this.collectionRepo.save(collection.removePlace(input.placeId))
  }
}
