import { CollectionNotFoundError } from '@domain/collection/errors/CollectionNotFoundError'
import { CollectionRepository } from '../ports/CollectionRepository'

export interface RenameCollectionInput {
  userId: string
  collectionId: string
  name: string
}

export class RenameCollectionUseCase {
  constructor(private readonly collectionRepo: CollectionRepository) {}

  async execute(input: RenameCollectionInput): Promise<void> {
    const collection = await this.collectionRepo.findById(input.collectionId)
    if (!collection) throw new CollectionNotFoundError(input.collectionId)
    collection.assertOwnership(input.userId)
    await this.collectionRepo.save(collection.rename(input.name))
  }
}
