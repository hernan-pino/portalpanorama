import { Collection } from '@domain/collection/Collection'
import { CollectionRepository, CollectionSummary } from '../ports/CollectionRepository'

export interface SaveContextOutput {
  collections: CollectionSummary[]
  // Lugares ya guardados en alguna lista → estado "guardado" del corazón.
  savedPlaceIds: string[]
  // Id de la lista "Favoritos" si ya existe (null = se crea al primer guardado).
  defaultCollectionId: string | null
}

// Datos que necesitan la ficha, explorar y home para el botón/corazón de guardar:
// las listas del usuario (selector), qué lugares ya tiene guardados (marca del
// corazón) y cuál es su lista por defecto. Read-model liviano y específico — antes
// estas páginas tiraban del GetUserDashboard completo (arrastraba el historial).
export class GetSaveContextUseCase {
  constructor(private readonly collectionRepo: CollectionRepository) {}

  async execute(userId: string): Promise<SaveContextOutput> {
    const [collections, savedPlaceIds] = await Promise.all([
      this.collectionRepo.findByOwnerId(userId),
      this.collectionRepo.findSavedPlaceIds(userId),
    ])
    const def = collections.find((c) => c.name === Collection.DEFAULT_NAME)
    return { collections, savedPlaceIds, defaultCollectionId: def?.id ?? null }
  }
}
