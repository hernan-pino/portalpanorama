// DTO plano del form de lista curada (cliente → server action). Todo string/array
// serializable porque sale de <input>/<select>/checkbox; la action valida y coacciona
// con Zod. La regla habla en SLUGS (mismo vocabulario que el explorar/SearchParams),
// no en ids: así una lista se resuelve igual que un filtro de búsqueda.

import type { CuratedListKind, CuratedPinKind } from '@domain/curatedList/CuratedList'

// La regla = subconjunto de filtros del explorar. Single-selects vacíos = "sin filtro".
export interface CuratedRuleValues {
  categorySlug: string
  subcategorySlug: string
  communeSlug: string
  neighborhoodSlug: string
  metroLineCode: string
  priceRanges: string[]
  socialTagSlugs: string[]
  accessTagSlugs: string[]
  vibeTagSlugs: string[]
  occasionTagSlugs: string[]
  experienceTagSlugs: string[]
  walkInOnly: boolean
}

// Fijado a mano: lugar que va arriba + su bajada/nota editorial. `pinKind` define el
// nivel (destacado-artículo o mención honorífica). El orden en el array define el sortOrder.
export interface CuratedPinValues {
  placeId: string
  pinKind: CuratedPinKind
  blurb: string
}

export interface CuratedListFormValues {
  name: string
  kind: CuratedListKind
  description: string
  intro: string
  coverImageUrl: string
  rule: CuratedRuleValues
  pins: CuratedPinValues[]
  isPublished: boolean
}

export const KIND_OPTIONS: { value: CuratedListKind; label: string }[] = [
  { value: 'GUIDE', label: 'Guía (exhaustiva por categoría/comuna)' },
  { value: 'OCCASION', label: 'Ocasión (por intención: primera cita, con niños…)' },
]

export const EMPTY_RULE: CuratedRuleValues = {
  categorySlug: '',
  subcategorySlug: '',
  communeSlug: '',
  neighborhoodSlug: '',
  metroLineCode: '',
  priceRanges: [],
  socialTagSlugs: [],
  accessTagSlugs: [],
  vibeTagSlugs: [],
  occasionTagSlugs: [],
  experienceTagSlugs: [],
  walkInOnly: false,
}

// Una regla "vacía" seleccionaría todo el catálogo: el dominio la rechaza. Se espeja
// acá para avisar en el cliente antes de mandar (mismo criterio que isRuleEmpty).
export function isRuleEmptyValues(r: CuratedRuleValues): boolean {
  return (
    !r.categorySlug &&
    !r.subcategorySlug &&
    !r.communeSlug &&
    !r.neighborhoodSlug &&
    !r.metroLineCode &&
    r.priceRanges.length === 0 &&
    r.socialTagSlugs.length === 0 &&
    r.accessTagSlugs.length === 0 &&
    r.vibeTagSlugs.length === 0 &&
    r.occasionTagSlugs.length === 0 &&
    r.experienceTagSlugs.length === 0 &&
    !r.walkInOnly
  )
}
