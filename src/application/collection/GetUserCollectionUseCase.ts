import { CollectionRepository, UserCollectionDetailView } from '../ports/CollectionRepository'

export interface GetUserCollectionInput {
  userId: string
  collectionId: string
}

// Abre UNA lista del usuario y devuelve sus lugares (tarjetas). El ownership se
// resuelve en la query del repo (filtra por ownerId): si la lista no es del
// usuario o no existe, retorna null y la página muestra "no encontrada". Read-model
// puro, no pasa por el agregado (no muta).
export class GetUserCollectionUseCase {
  constructor(private readonly collectionRepo: CollectionRepository) {}

  execute(input: GetUserCollectionInput): Promise<UserCollectionDetailView | null> {
    return this.collectionRepo.findOwnedWithPlaces(input.collectionId, input.userId)
  }
}
