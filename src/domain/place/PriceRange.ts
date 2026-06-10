// 5 buckets de presupuesto (incluye Gratis) — decisión C6. El filtro
// "¿Cuánto gasto?" mapea directo a estos valores. No es dinero (no es Money):
// es un rango/bucket, por eso enum y no Value Object monetario.
export enum PriceRange {
  FREE = 'FREE',
  UNDER_5000 = 'UNDER_5000',
  FROM_5000_TO_15000 = 'FROM_5000_TO_15000',
  FROM_15000_TO_30000 = 'FROM_15000_TO_30000',
  OVER_30000 = 'OVER_30000',
}
