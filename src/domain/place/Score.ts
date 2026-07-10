// Reputación calculada (decisión 2.5) = promedio bayesiano de la nota de Google.
//
//   score = (v / (v + m)) · R  +  (m / (v + m)) · C
//
//   R = googleRating del lugar         v = googleReviewCount del lugar
//   C = prior (promedio de referencia) m = umbral de confianza (fijo en 50)
//
// Tira hacia el prior a los lugares con pocas reseñas: un 5,0 con 3 reseñas
// (→ 4,25) NO le gana a un 4,7 con 2.000 (→ 4,69). Es el orden por defecto de
// toda búsqueda. Se recalcula al cargar/editar y en batch cuando entra carga
// nueva (no en runtime). Borde: sin reseñas de Google → score = C.
//
// El prior C es POR CATEGORÍA (sesión 27): el promedio global (~4,5) castigaba a
// las categorías de nota alta (juegos ~4,7) y regalaba puntos a las duras. Cada
// lugar se compara contra el promedio de su categoría; si la categoría todavía
// tiene pocos lugares con rating (< MIN_CATEGORY_SAMPLE), el promedio de la
// categoría no es confiable y se cae al global.

const CONFIDENCE_THRESHOLD = 50
const MIN_CATEGORY_SAMPLE = 15

// Estadística de rating de una categoría: promedio y cuántos lugares lo aportan.
export interface CategoryRatingStats {
  average: number
  ratedCount: number
}

export class Score {
  static readonly DEFAULT_CONFIDENCE = CONFIDENCE_THRESHOLD
  static readonly MIN_CATEGORY_SAMPLE = MIN_CATEGORY_SAMPLE

  // Prior C del bayesiano: el promedio de la categoría si su muestra alcanza,
  // el global si no (categoría chica o sin datos).
  static prior(
    category: CategoryRatingStats | null | undefined,
    globalAverage: number,
  ): number {
    if (!category || category.ratedCount < MIN_CATEGORY_SAMPLE) return globalAverage
    return category.average
  }

  // Promedio bayesiano. `m` re-afinable con data si hace falta.
  static bayesian(
    rating: number | null | undefined,
    reviewCount: number | null | undefined,
    prior: number,
    m: number = CONFIDENCE_THRESHOLD,
  ): number {
    const R = rating ?? 0
    const v = reviewCount ?? 0
    if (v <= 0) return prior
    return (v / (v + m)) * R + (m / (v + m)) * prior
  }
}
