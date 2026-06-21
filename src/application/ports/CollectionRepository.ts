import { Collection } from '@domain/collection/Collection'
import { PlaceCardView } from './PlaceRepository'

// Resumen de una lista del usuario para el listado de "Mis listas".
export interface CollectionSummary {
  id: string
  name: string
  itemCount: number
  coverUrl?: string
}

// Lista curada resuelta para su landing SEO (incluye las tarjetas de lugares).
export interface CuratedCollectionView {
  id: string
  slug: string
  name: string
  description?: string
  places: PlaceCardView[]
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

  // Ids de los lugares que el usuario tiene guardados en CUALQUIERA de sus listas.
  // Alimenta el estado "ya guardado" del corazón en ficha/explorar/home.
  findSavedPlaceIds(ownerId: string): Promise<string[]>

  // Landing SEO de una lista curada (ownerId null)
  findCuratedBySlug(slug: string): Promise<CuratedCollectionView | null>
}
