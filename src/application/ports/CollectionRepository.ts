import { Collection } from '@domain/collection/Collection'
import { PlaceCardView } from './PlaceRepository'

// Resumen de una lista del usuario para el listado de "Mis listas".
export interface CollectionSummary {
  id: string
  name: string
  itemCount: number
  coverUrl?: string
}

// Detalle de una lista privada del usuario con sus lugares (vista de "abrir la lista").
export interface UserCollectionDetailView {
  id: string
  name: string
  itemCount: number
  places: PlaceCardView[]
}

export interface CollectionRepository {
  findById(id: string): Promise<Collection | null>
  save(collection: Collection): Promise<void>
  delete(id: string): Promise<void>

  // Listas privadas del usuario
  findByOwnerId(ownerId: string): Promise<CollectionSummary[]>

  // Detalle de UNA lista del usuario con sus lugares. Filtra por ownerId en la
  // query (anti-IDOR): si la lista no existe o no es del usuario, devuelve null.
  findOwnedWithPlaces(
    collectionId: string,
    ownerId: string,
  ): Promise<UserCollectionDetailView | null>

  // Pares (lista, lugar) de todo lo guardado por el usuario. Alimenta el estado
  // "ya guardado" del corazón Y el "en qué listas está" del selector (sesión 27).
  findSavedItems(ownerId: string): Promise<{ collectionId: string; placeId: string }[]>
}
