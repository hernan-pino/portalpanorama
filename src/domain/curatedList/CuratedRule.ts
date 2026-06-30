import { PriceRange } from '@domain/place/PriceRange'

// La REGLA de una lista curada: el subconjunto de filtros del explorar que define
// QUÉ lugares entran. Se resuelve al leer la lista (contra SearchService) → la lista
// se mantiene completa sola. Es un objeto de datos (sin FK a application): la
// aplicación lo mapea a `SearchParams` y la infra lo persiste como JSON.
//
// OCCASION ("Ideal para") y EXPERIENCE ("Experiencia") ya son filtrables (sesión 14),
// así que una lista de ocasión —"Para una primera cita"— se expresa como regla y se
// mantiene viva sola a medida que se etiqueta contenido.
export interface CuratedRule {
  readonly categorySlug?: string
  readonly subcategorySlug?: string
  readonly communeSlug?: string
  readonly neighborhoodSlug?: string
  readonly metroLineCode?: string
  readonly metroStationSlug?: string
  readonly priceRanges?: ReadonlyArray<PriceRange>
  readonly socialTagSlugs?: ReadonlyArray<string>
  readonly accessTagSlugs?: ReadonlyArray<string>
  readonly vibeTagSlugs?: ReadonlyArray<string>
  readonly occasionTagSlugs?: ReadonlyArray<string>
  readonly experienceTagSlugs?: ReadonlyArray<string>
  readonly walkInOnly?: boolean
}

// Una regla "vacía" seleccionaría TODO el catálogo: casi siempre un error de carga.
// El dominio lo rechaza al crear la lista (ver CuratedList.create).
export function isRuleEmpty(rule: CuratedRule): boolean {
  return (
    !rule.categorySlug &&
    !rule.subcategorySlug &&
    !rule.communeSlug &&
    !rule.neighborhoodSlug &&
    !rule.metroLineCode &&
    !rule.metroStationSlug &&
    (rule.priceRanges?.length ?? 0) === 0 &&
    (rule.socialTagSlugs?.length ?? 0) === 0 &&
    (rule.accessTagSlugs?.length ?? 0) === 0 &&
    (rule.vibeTagSlugs?.length ?? 0) === 0 &&
    (rule.occasionTagSlugs?.length ?? 0) === 0 &&
    (rule.experienceTagSlugs?.length ?? 0) === 0 &&
    !rule.walkInOnly
  )
}
