import { PriceRange } from '@domain/place/PriceRange'

// Parser de los query params de /explorar → SearchParams del use case. No valida
// contra catálogos en memoria (los slugs viven en BD): solo sanea forma y deja
// que el SearchService no haga match si un slug no existe. Mapea las claves de URL
// (español) a la forma tipada que consume getSearchPlacesUseCase().

export interface RawSearchParams {
  q?: string
  categoria?: string
  subcategoria?: string
  con?: string // tags sociales (csv)
  precio?: string // buckets PriceRange (csv)
  comuna?: string
  barrio?: string
  metro?: string // código de línea (L1, L5…)
  estacion?: string
  ambiente?: string // tags de vibe (csv)
  acceso?: string // tags de accesibilidad (csv)
  sinreserva?: string // '1'
  pagina?: string
  view?: string
  [key: string]: string | undefined
}

export interface ParsedSearchParams {
  query?: string
  categorySlug?: string
  subcategorySlug?: string
  socialTagSlugs?: string[]
  priceRanges?: PriceRange[]
  communeSlug?: string
  neighborhoodSlug?: string
  metroLineCode?: string
  metroStationSlug?: string
  vibeTagSlugs?: string[]
  accessTagSlugs?: string[]
  walkInOnly?: boolean
  page: number
  view: 'grid' | 'lista'
}

// slug: minúsculas, números y guiones (forma, no existencia).
function slug(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const s = raw.trim().toLowerCase().slice(0, 60)
  return /^[a-z0-9-]+$/.test(s) ? s : undefined
}

// lista de slugs desde csv: sanea, descarta vacíos, dedupe, tope de 8.
function slugList(raw: string | undefined): string[] | undefined {
  if (!raw) return undefined
  const out = [...new Set(raw.split(',').map((s) => slug(s)).filter((s): s is string => !!s))]
  return out.length ? out.slice(0, 8) : undefined
}

const PRICE_VALUES = new Set<string>(Object.values(PriceRange))

function parsePriceRanges(raw: string | undefined): PriceRange[] | undefined {
  if (!raw) return undefined
  const out = [...new Set(raw.split(',').map((s) => s.trim().toUpperCase()))]
    .filter((s) => PRICE_VALUES.has(s)) as PriceRange[]
  return out.length ? out : undefined
}

// Código de línea de metro: L1, L4A, L6… (letra L + dígito + sufijo opcional).
function metroLineCode(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  const s = raw.trim().toUpperCase().slice(0, 4)
  return /^L[0-9][A-Z]?$/.test(s) ? s : undefined
}

export function parseSearchParams(raw: RawSearchParams): ParsedSearchParams {
  const rawPage = parseInt(raw.pagina ?? '', 10)
  const page = isNaN(rawPage) ? 1 : Math.max(1, rawPage)

  return {
    query: raw.q?.trim().slice(0, 100) || undefined,
    categorySlug: slug(raw.categoria),
    subcategorySlug: slug(raw.subcategoria),
    socialTagSlugs: slugList(raw.con),
    priceRanges: parsePriceRanges(raw.precio),
    communeSlug: slug(raw.comuna),
    neighborhoodSlug: slug(raw.barrio),
    metroLineCode: metroLineCode(raw.metro),
    metroStationSlug: slug(raw.estacion),
    vibeTagSlugs: slugList(raw.ambiente),
    accessTagSlugs: slugList(raw.acceso),
    walkInOnly: raw.sinreserva === '1' ? true : undefined,
    page,
    view: raw.view === 'lista' ? 'lista' : 'grid',
  }
}
