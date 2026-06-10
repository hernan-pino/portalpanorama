// ⚠️ STOPGAP TEMPORAL (Etapa 4E) — NO es el diseño final.
// Slugs de categoría para que el código VIEJO de explorar (parseSearchParams),
// aún sin reescribir, compile en dev. Se reemplaza por queries de catálogo a la
// BD (GetCategories) cuando se reescriba explorar (pantalla #2 de 4E).
export const CATEGORY_SLUGS = [
  'gastronomia',
  'naturaleza',
  'arte-cultura',
  'locales-tiendas',
  'shows',
  'talleres',
  'ferias',
] as const

export type CategorySlug = (typeof CATEGORY_SLUGS)[number]

export function isValidCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value)
}
