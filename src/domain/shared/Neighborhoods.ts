// ⚠️ STOPGAP TEMPORAL (Etapa 4E) — NO es el diseño final.
// Constantes de catálogo para que el código VIEJO de explorar (SearchBar,
// FilterRail, parseSearchParams), aún sin reescribir, compile en dev. Sin esto,
// el `Module not found` envenena toda la compilación de webpack y tumba rutas
// no relacionadas (p. ej. la ficha). Se reemplaza por queries de catálogo a la
// BD cuando se reescriba explorar (pantalla #2 de 4E).
export const NEIGHBORHOODS = [
  'Barrio Lastarria',
  'Bellavista',
  'Barrio Italia',
  'Barrio París-Londres',
  'Isidora Goyenechea',
  'Estación Central',
  'Patronato',
  'Barrio Yungay',
  'Barrio Brasil',
] as const

export type Neighborhood = (typeof NEIGHBORHOODS)[number]

export function isValidNeighborhood(value: string): value is Neighborhood {
  return (NEIGHBORHOODS as readonly string[]).includes(value)
}
