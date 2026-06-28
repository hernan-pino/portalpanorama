import { PriceRange } from '@domain/place/PriceRange'
import { PlaceCardView } from './PlaceRepository'

// Filtros vivos del MVP: contexto social · gasto · dónde (comuna/barrio/metro) ·
// accesibilidad · ambiente · ideal para (ocasión) · experiencia. El orden por
// defecto SIEMPRE es score desc (reputación). "Sin reserva" se deriva de reservation.
export interface SearchParams {
  query?: string
  categorySlug?: string
  subcategorySlug?: string
  communeSlug?: string
  neighborhoodSlug?: string
  metroLineCode?: string
  metroStationSlug?: string
  priceRanges?: PriceRange[]
  socialTagSlugs?: string[]
  accessTagSlugs?: string[]
  vibeTagSlugs?: string[]
  occasionTagSlugs?: string[] // "Ideal para" (OCCASION)
  experienceTagSlugs?: string[] // "Experiencia" (EXPERIENCE)
  walkInOnly?: boolean // "Sin reserva"
  page?: number
  limit?: number
}

export interface SearchResult {
  items: PlaceCardView[]
  total: number
  page: number
  totalPages: number
}

// Una opción de faceta con su contador. Las opciones con count 0 se ocultan en
// la UI (decisión P3: "ocultar vacíos" → disimula la baja densidad del arranque).
export interface FacetCount {
  value: string // slug o enum
  label: string
  count: number
}

// Contadores estáticos por dimensión (MVP: no se recombinan dinámicamente).
export interface PlaceFacets {
  categories: FacetCount[]
  // Subcategorías con contador. Cada una pertenece a una sola categoría; la UI
  // las agrupa bajo su categoría (vía el catálogo) y oculta las de count 0.
  subcategories: FacetCount[]
  communes: FacetCount[]
  neighborhoods: FacetCount[]
  metroLines: FacetCount[]
  priceRanges: FacetCount[]
  social: FacetCount[]
  access: FacetCount[]
  vibe: FacetCount[]
  occasion: FacetCount[] // "Ideal para" (OCCASION)
  experience: FacetCount[] // "Experiencia" (EXPERIENCE)
}

// Sugerencia de autocompletado (la barra de búsqueda). Shape liviano: solo lo que
// se muestra en el dropdown y el slug para ir directo a la ficha.
export interface PlaceSuggestion {
  slug: string
  name: string
  categoryName: string
  communeName: string
  coverUrl?: string
}

export interface SearchService {
  search(params: SearchParams): Promise<SearchResult>
  getFacets(): Promise<PlaceFacets>
  // Autocompletado tolerante (parcial + sin acentos + typos). Devuelve hasta
  // `limit` lugares cuyo nombre/rubro matchean `query`, mejor match primero.
  suggest(query: string, limit: number): Promise<PlaceSuggestion[]>
}
