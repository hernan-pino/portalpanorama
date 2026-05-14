export const CATEGORY_SLUGS = [
  'restaurantes',
  'cafes',
  'bares',
  'vida-nocturna',
  'cultura',
  'outdoor',
  'entretenimiento',
  'deportes',
  'museos',
  'tiendas',
  'servicios',
] as const

export type CategorySlug = (typeof CATEGORY_SLUGS)[number]

export function isValidCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value)
}
