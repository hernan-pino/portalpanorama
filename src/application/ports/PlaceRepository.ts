import { Place } from '@domain/place/Place'

// Tarjeta de lugar para grillas/relacionados. Denormalizada (nombres resueltos),
// no es el agregado de dominio: es un read-model para la UI.
export interface PlaceCardView {
  id: string
  slug: string
  name: string
  categoryName: string
  communeName: string
  neighborhoodName?: string
  priceRange?: string
  coverUrl?: string
  googleRating?: number
  googleReviewCount?: number
  score: number
}

// Ficha completa para la página de detalle. Todo lo que se renderiza, con los
// catálogos ya resueltos a nombre/color.
export interface PlaceDetailView {
  id: string
  slug: string
  name: string
  description?: string
  menuUrl?: string
  category: { slug: string; name: string }
  subcategory: { slug: string; name: string }
  secondaryCategory?: { slug: string; name: string }
  address?: string
  commune: { slug: string; name: string }
  neighborhood?: { slug: string; name: string }
  lat?: number
  lng?: number
  metroStation?: { slug: string; name: string; lines: { code: string; color: string }[] }
  accessDetail?: string
  reference?: string
  rainPolicy?: string
  priceRange?: string
  reservation?: string
  paymentMethods: string[]
  schedule?: string
  phone?: string
  website?: string
  instagram?: string
  googleRating?: number
  googleReviewCount?: number
  score: number
  images: { url: string; alt?: string; credit?: string; isPrimary: boolean }[]
  tags: { slug: string; name: string; layer: string }[]
}

// Fila mínima para el recálculo batch del score bayesiano.
export interface PlaceRatingRow {
  id: string
  googleRating: number | null
  googleReviewCount: number | null
}

export interface PlaceRepository {
  // ── Agregado de dominio (CRUD admin + scoring) ──
  findById(id: string): Promise<Place | null>
  findBySlug(slug: string): Promise<Place | null>
  save(place: Place): Promise<void>

  // ── Read-models para la UI ──
  getDetailBySlug(slug: string): Promise<PlaceDetailView | null>
  findRelated(placeId: string, limit: number): Promise<PlaceCardView[]>

  // ── Reputación (decisión 2.5) ──
  // Promedio global publicado (prior `C` del bayesiano).
  globalAverageRating(): Promise<number>
  // Todas las filas con rating para re-batir el score en batch.
  findRatingsForScoring(): Promise<PlaceRatingRow[]>
  updateScores(scores: { id: string; score: number }[]): Promise<void>
}
