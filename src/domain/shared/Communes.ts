export const COMMUNES = [
  'Santiago',
  'Providencia',
  'Ñuñoa',
  'Las Condes',
  'Vitacura',
  'La Reina',
  'Macul',
  'San Miguel',
  'Recoleta',
  'Independencia',
  'Estación Central',
  'Maipú',
  'La Florida',
  'Peñalolén',
  'Lo Barnechea',
  'Huechuraba',
  'Conchalí',
  'San Joaquín',
  'Quinta Normal',
  'Pedro Aguirre Cerda',
  'San Bernardo',
  'Cerrillos',
  'Pudahuel',
  'Puente Alto',
] as const

export type Commune = (typeof COMMUNES)[number]

export function isValidCommune(value: string): value is Commune {
  return (COMMUNES as readonly string[]).includes(value)
}
