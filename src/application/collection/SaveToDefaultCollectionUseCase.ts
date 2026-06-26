import { createId } from '@paralleldrive/cuid2'
import { Collection } from '@domain/collection/Collection'
import { CollectionNotFoundError } from '@domain/collection/errors/CollectionNotFoundError'
import { CollectionRepository } from '../ports/CollectionRepository'

export interface SaveToDefaultCollectionInput {
  userId: string
  placeId: string
}

// Guardar en "Favoritos" en un toque. La lista por defecto se crea perezosamente
// la primera vez (así toda persona tiene dónde guardar sin obligarla a nombrar una
// lista). Idempotente: el dominio no duplica el lugar.
export class SaveToDefaultCollectionUseCase {
  constructor(private readonly collectionRepo: CollectionRepository) {}

  async execute(input: SaveToDefaultCollectionInput): Promise<{ collectionId: string }> {
    const existing = (await this.collectionRepo.findByOwnerId(input.userId)).find(
      (c) => c.name === Collection.DEFAULT_NAME,
    )

    if (!existing) {
      // No existe aún: la creamos ya con el lugar adentro (un solo save).
      const now = new Date()
      const collection = Collection.create({
        id: createId(),
        name: Collection.DEFAULT_NAME,
        ownerId: input.userId,
        items: [],
        createdAt: now,
        updatedAt: now,
      }).addPlace(input.placeId)
      await this.collectionRepo.save(collection)
      return { collectionId: collection.id }
    }

    const collection = await this.collectionRepo.findById(existing.id)
    if (!collection) throw new CollectionNotFoundError(existing.id)
    collection.assertOwnership(input.userId)
    await this.collectionRepo.save(collection.addPlace(input.placeId))
    return { collectionId: collection.id }
  }
}
