// Objetivo reseñado extensible (decisión 2.4): hoy PLACE; DISH/EVENT entran sin
// tocar el schema (no hay FK al objetivo, la integridad la cuida el dominio).
export enum ReviewTarget {
  PLACE = 'PLACE',
  DISH = 'DISH',
  EVENT = 'EVENT',
}
