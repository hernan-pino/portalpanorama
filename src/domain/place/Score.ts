// Reputación calculada (decisión 2.5) = promedio bayesiano de la nota de Google.
//
//   score = (v / (v + m)) · R  +  (m / (v + m)) · C
//
//   R = googleRating del lugar         v = googleReviewCount del lugar
//   C = promedio global (prior)        m = umbral de confianza (fijo en 50)
//
// Tira hacia el promedio global a los lugares con pocas reseñas: un 5,0 con 3
// reseñas (→ 4,25) NO le gana a un 4,7 con 2.000 (→ 4,69). Es el orden por
// defecto de toda búsqueda. Se recalcula al cargar/editar y en batch cuando
// entra carga nueva (no en runtime). Borde: sin reseñas de Google → score = C.

const CONFIDENCE_THRESHOLD = 50

export class Score {
  static readonly DEFAULT_CONFIDENCE = CONFIDENCE_THRESHOLD

  // Promedio bayesiano. `m` re-afinable con data si hace falta.
  static bayesian(
    rating: number | null | undefined,
    reviewCount: number | null | undefined,
    globalAverage: number,
    m: number = CONFIDENCE_THRESHOLD,
  ): number {
    const R = rating ?? 0
    const v = reviewCount ?? 0
    if (v <= 0) return globalAverage
    return (v / (v + m)) * R + (m / (v + m)) * globalAverage
  }
}
