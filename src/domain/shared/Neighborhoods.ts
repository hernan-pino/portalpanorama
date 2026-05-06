export const NEIGHBORHOODS = [
  'Lastarria',
  'Bellavista',
  'Providencia',
  'Italia',
  'Ñuñoa',
  'Vitacura',
  'Las Condes',
  'Yungay',
  'Brasil',
  'Centro',
  'Barrio Suecia',
  'Lo Barnechea',
  'La Reina',
  'Macul',
  'San Miguel',
  'Estación Central',
  'Independencia',
  'Recoleta',
  'Santiago Centro',
  'Maipú',
] as const

export type Neighborhood = (typeof NEIGHBORHOODS)[number]

export function isValidNeighborhood(value: string): value is Neighborhood {
  return (NEIGHBORHOODS as readonly string[]).includes(value)
}
