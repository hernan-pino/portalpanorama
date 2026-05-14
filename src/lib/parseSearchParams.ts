import { isValidNeighborhood, type Neighborhood } from '@domain/shared/Neighborhoods'
import { isValidCategorySlug, type CategorySlug } from '@domain/shared/Categories'

export interface RawSearchParams {
  q?: string
  barrio?: string
  comuna?: string
  categoria?: string
  precio?: string
  rating?: string
  premium?: string
  pagina?: string
  view?: string
  [key: string]: string | undefined
}

export interface ParsedSearchParams {
  query: string | undefined
  barrio: Neighborhood | undefined
  comuna: string | undefined
  categoria: CategorySlug | undefined
  priceRanges: number[] | undefined
  isPremium: boolean | undefined
  page: number
  view: 'grid' | 'lista'
}

export function parseSearchParams(raw: RawSearchParams): ParsedSearchParams {
  const query = raw.q?.trim().slice(0, 100) || undefined

  const barrio =
    raw.barrio && isValidNeighborhood(raw.barrio) ? raw.barrio : undefined

  const comuna =
    typeof raw.comuna === 'string' ? raw.comuna.trim().slice(0, 60) || undefined : undefined

  const categoria =
    raw.categoria && isValidCategorySlug(raw.categoria) ? raw.categoria : undefined

  const priceRanges = raw.precio
    ? raw.precio.split(',').map((s) => parseInt(s, 10)).filter((n) => !isNaN(n) && n >= 1 && n <= 4)
    : undefined

  const isPremium = raw.premium === '1' ? true : undefined

  const rawPage = parseInt(raw.pagina ?? '', 10)
  const page = isNaN(rawPage) ? 1 : Math.max(1, rawPage)

  const view = raw.view === 'lista' ? 'lista' : 'grid'

  return { query, barrio, comuna, categoria, priceRanges, isPremium, page, view }
}
