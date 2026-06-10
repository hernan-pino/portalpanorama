import { createId } from '@paralleldrive/cuid2'
import { Collection } from '@domain/collection/Collection'
import { CollectionRepository } from '../ports/CollectionRepository'

export interface CreateCollectionInput {
  ownerId: string
  name: string
}

export class CreateCollectionUseCase {
  constructor(private readonly collectionRepo: CollectionRepository) {}

  async execute(input: CreateCollectionInput): Promise<{ collectionId: string }> {
    const now = new Date()
    const collection = Collection.create({
      id: createId(),
      name: input.name,
      ownerId: input.ownerId,
      isCurated: false,
      items: [],
      createdAt: now,
      updatedAt: now,
    })
    await this.collectionRepo.save(collection)
    return { collectionId: collection.id }
  }
}
