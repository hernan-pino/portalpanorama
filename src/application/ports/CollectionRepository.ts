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

export interface CollectionRepository {
  findById(id: string): Promise<Collection | null>
  save(collection: Collection): Promise<void>
  delete(id: string): Promise<void>

  // Listas privadas del usuario
  findByOwnerId(ownerId: string): Promise<CollectionSummary[]>

  // Landing SEO de una lista curada (ownerId null)
  findCuratedBySlug(slug: string): Promise<CuratedCollectionView | null>
}
