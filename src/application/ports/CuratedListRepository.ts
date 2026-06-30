import { CuratedList, CuratedListKind } from '@domain/curatedList/CuratedList'
import { FeaturedPlaceView, PlaceCardView } from './PlaceRepository'

// Fila de la tabla del panel de admin (todos los estados). Denormalizada; el
// conteo de destacados ayuda a ver de un vistazo qué tan armada está la lista.
export interface CuratedListAdminRow {
  id: string
  slug: string
  name: string
  kind: CuratedListKind
  isPublished: boolean
  pinCount: number
  updatedAt: Date
}

// Tarjeta de lista curada para la home / índices. Liviana: solo lo que se muestra
// (sin resolver la regla). El contador de lugares se resuelve al abrir la landing.
export interface CuratedListCardView {
  slug: string
  name: string
  kind: CuratedListKind
  description?: string
  coverImageUrl?: string
}

export interface CuratedListRepository {
  // ── Agregado de dominio (CRUD admin) ──
  findById(id: string): Promise<CuratedList | null>
  // Por slug, en cualquier estado (el use case decide si un borrador se muestra).
  findBySlug(slug: string): Promise<CuratedList | null>
  save(list: CuratedList): Promise<void>
  delete(id: string): Promise<void>

  // ── Admin ──
  listForAdmin(): Promise<CuratedListAdminRow[]>

  // ── Read-models públicos ──
  // Listas publicadas para la home (orden: publishedAt desc).
  listPublished(): Promise<CuratedListCardView[]>
  // Slugs publicados + fecha de edición, para el sitemap.xml.
  listPublishedForSitemap(): Promise<{ slug: string; updatedAt: Date }[]>
}

// Read-model de la landing /lista/[slug]: chrome editorial + destacados (con su
// bajada y la card del lugar ya resuelta) + menciones honoríficas (nota de una línea,
// nivel intermedio) + el resto de la regla. Lo arma el use case GetCuratedListBySlug
// (no el repo), componiendo CuratedList + SearchService.
export interface CuratedListPageView {
  slug: string
  name: string
  kind: CuratedListKind
  description?: string
  intro?: string
  coverImageUrl?: string
  pinned: { blurb?: string; place: FeaturedPlaceView }[]
  mentions: { note?: string; place: FeaturedPlaceView }[]
  rest: PlaceCardView[]
  total: number
}
