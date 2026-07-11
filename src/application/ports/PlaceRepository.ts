import { Place } from '@domain/place/Place'
import { PriceRange } from '@domain/place/PriceRange'
import { ReservationPolicy } from '@domain/place/ReservationPolicy'

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
  // Líneas de metro de la estación más cercana (M2M: normalmente 1, a veces 2).
  // La tarjeta muestra el/los badge(s) con su color oficial. Vacío si no aplica.
  metroLines?: { code: string; color: string }[]
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
  socialLinks: { network: string; url: string }[]
  googleRating?: number
  googleReviewCount?: number
  // place_id de Google: deja que "Cómo llegar" apunte a la ficha exacta del
  // negocio (destination_place_id) en vez de geocodificar la dirección a un punto.
  googlePlaceId?: string
  score: number
  images: { url: string; alt?: string; credit?: string; isPrimary: boolean }[]
  tags: { slug: string; name: string; layer: string }[]
  // Contenedor padre-hijo (un solo nivel en pantalla). `parent` solo si está
  // publicado (su ficha es navegable). `children` = hijos-con-ficha publicados.
  // `points` = spots sin ficha (mirador/kiosco) listados bajo "Qué hay en [X]".
  parent?: { slug: string; name: string }
  children: PlaceCardView[]
  points: { name: string; description?: string; kind?: string }[]
  // Marca/Negocio dueño de la sucursal (bloque "Por [Marca] ↗" linkeable a /marca).
  brand?: { slug: string; name: string; logoUrl?: string }
}

// Destacado de una lista curada: la tarjeta + el horario (la landing lo muestra
// como "data importante" en la fila editorial). Es la card enriquecida; solo se
// resuelve para los pins, por eso el horario no carga en PlaceCardView normal.
export interface FeaturedPlaceView extends PlaceCardView {
  schedule?: string
}

// Opción de "lugar padre" para el selector del form de admin.
export interface PlaceParentOption {
  id: string
  name: string
}

// Fila mínima para el recálculo batch del score bayesiano.
export interface PlaceRatingRow {
  id: string
  categoryId: string
  googleRating: number | null
  googleReviewCount: number | null
}

// Promedio y muestra de rating por categoría (prior C por categoría, sesión 27).
export interface CategoryRatingStat {
  categoryId: string
  average: number
  ratedCount: number
}

// Fila de la tabla del admin (todos los estados, no solo PUBLISHED). Denormalizada
// para listar sin tocar el agregado. Ordenada por updatedAt desc en el repo.
export interface PlaceAdminRow {
  id: string
  slug: string
  name: string
  status: string
  categoryName: string
  communeName: string
  googleRating?: number
  score: number
  updatedAt: Date
  // Engagement: visitas de usuarios logueados (VisitHistory) y veces guardado
  // (CollectionItem, en cualquier lista). Las páginas vistas anónimas viven en GA4.
  visitCount: number
  saveCount: number
}

// ── Panel de negocio (dueño verificado) ──────────────────────────────────────
// Fila del panel del dueño: su ficha + engagement (mismo _count que el admin).
export interface OwnedPlaceRow {
  id: string
  slug: string
  name: string
  status: string
  categoryName: string
  communeName: string
  coverUrl?: string
  googleRating?: number
  visitCount: number
  saveCount: number
}

// Campos que el DUEÑO verificado puede editar directo (info operacional, no
// estructural). El nombre, categoría, ubicación, rating, tags y las redes EXTRA
// (socialLinks) los controla el admin. El Instagram principal sí lo edita el dueño.
export interface OwnerEditableFields {
  description?: string
  schedule?: string
  phone?: string
  website?: string
  instagram?: string
  menuUrl?: string
  priceRange?: PriceRange
  reservation?: ReservationPolicy
  accessDetail?: string
  reference?: string
}

// Vista para poblar el form de edición del dueño + los ids de propiedad para el
// guard de autorización (gestiona si es su owner directo o dueño de su marca).
export interface OwnerEditablePlaceView extends OwnerEditableFields {
  id: string
  slug: string
  name: string
  categoryName: string
  communeName: string
  ownerId: string | null
  brandOwnerId: string | null
}

export interface PlaceRepository {
  // ── Agregado de dominio (CRUD admin + scoring) ──
  findById(id: string): Promise<Place | null>
  findBySlug(slug: string): Promise<Place | null>
  save(place: Place): Promise<void>
  // Borrado duro (irreversible). Las relaciones del Place caen por Cascade
  // (imágenes/tags/puntos/reportes/visitas/items de colección) o SetNull
  // (hijos, marca, eventos): no deja huérfanos. Para quitar sin perder historial
  // está archive(); esto es el borrado definitivo del admin.
  delete(id: string): Promise<void>

  // ── Read-models para la UI ──
  getDetailBySlug(slug: string): Promise<PlaceDetailView | null>
  findRelated(placeId: string, limit: number): Promise<PlaceCardView[]>

  // Tarjetas (enriquecidas con horario) de los lugares PUBLICADOS cuyos ids se piden
  // (para resolver los destacados de una lista curada). Solo publicados: un destacado
  // archivado no aparece. Sin orden garantizado — el caller reordena según su criterio.
  findCardsByIds(ids: string[]): Promise<FeaturedPlaceView[]>

  // Slugs publicados + fecha de edición, para armar el sitemap.xml.
  listPublishedForSitemap(): Promise<{ slug: string; updatedAt: Date }[]>

  // ── Admin ──
  // Todos los lugares (cualquier estado) para la tabla del panel.
  listForAdmin(): Promise<PlaceAdminRow[]>

  // Lugares candidatos a ser "padre" en el selector del form (id + nombre).
  listForParentOptions(): Promise<PlaceParentOption[]>

  // Conteo de lugares por subcategoría primaria (para la vista de cobertura del
  // catálogo): total no-archivado y publicados. Subcategorías sin lugares no aparecen.
  coverageBySubcategory(): Promise<{ subcategoryId: string; total: number; published: number }[]>


  // Cadena de ids ancestros de un lugar (padre, abuelo, …), para el anti-ciclo.
  findAncestorIds(placeId: string): Promise<string[]>

  // ── Reputación (decisión 2.5) ──
  // Promedio global de la nota de Google (fallback del prior `C` del bayesiano).
  globalAverageRating(): Promise<number>
  // Promedio + muestra por categoría (prior `C` por categoría; Score.prior decide
  // si la muestra alcanza o se cae al global).
  categoryRatingStats(): Promise<CategoryRatingStat[]>
  // Todas las filas con rating para re-batir el score en batch.
  findRatingsForScoring(): Promise<PlaceRatingRow[]>
  updateScores(scores: { id: string; score: number }[]): Promise<void>

  // ── Panel de negocio (dueño verificado) ──
  // ¿Cuántas fichas gestiona el usuario? (liviano, para mostrar el acceso al panel).
  countManagedByUser(userId: string): Promise<number>
  // Fichas que gestiona un usuario: las que posee directo (ownerId) + las de las
  // marcas que posee (brand.ownerId). Con engagement, para el dashboard.
  findManagedByUser(userId: string): Promise<OwnedPlaceRow[]>
  // Ficha para el form de edición del dueño (campos editables + ids de propiedad
  // para el guard). Null si no existe.
  findOwnerEditableBySlug(slug: string): Promise<OwnerEditablePlaceView | null>
  // Aplica SOLO los campos operacionales editables por el dueño (no toca
  // nombre/categoría/ubicación/rating/score/estado/tags).
  updateOwnerEditableFields(placeId: string, fields: OwnerEditableFields): Promise<void>
}
