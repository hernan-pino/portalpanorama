import { describe, it, expect } from 'vitest'
import { Score } from './Score'

// El score es el orden por defecto de toda búsqueda; si esta fórmula se rompe,
// el ranking entero se corrompe en silencio. Por eso es lo primero que se testea.
describe('Score.bayesian', () => {
  it('sin reseñas de Google (count 0) devuelve el promedio global tal cual', () => {
    expect(Score.bayesian(5, 0, 4.2)).toBe(4.2)
    expect(Score.bayesian(null, 0, 3.8)).toBe(3.8)
    expect(Score.bayesian(undefined, undefined, 4)).toBe(4)
  })

  it('count negativo se trata como sin reseñas (borde defensivo)', () => {
    expect(Score.bayesian(5, -10, 4)).toBe(4)
  })

  it('tira al lugar con pocas reseñas hacia el promedio global', () => {
    // 5,0 con solo 3 reseñas, prior 4,0, m=50 → 215/53 ≈ 4,057
    expect(Score.bayesian(5, 3, 4)).toBeCloseTo(215 / 53, 6)
  })

  it('un 4,7 con muchas reseñas le gana a un 5,0 con pocas (el caso que justifica el bayesiano)', () => {
    const pocas = Score.bayesian(5, 3, 4) // ≈ 4,057
    const muchas = Score.bayesian(4.7, 2000, 4) // ≈ 4,683
    expect(muchas).toBeGreaterThan(pocas)
  })

  it('con muchísimas reseñas converge a la nota real del lugar', () => {
    expect(Score.bayesian(4.5, 100000, 4)).toBeCloseTo(4.5, 2)
  })

  it('rating nulo con reseñas positivas usa R=0 (no rompe)', () => {
    // (100/150)*0 + (50/150)*4 = 1,333…
    expect(Score.bayesian(null, 100, 4)).toBeCloseTo(4 / 3, 6)
  })

  it('respeta un umbral de confianza m custom', () => {
    // m=50 y count=50 → mitad nota, mitad prior
    expect(Score.bayesian(5, 50, 4, 50)).toBe(4.5)
  })
})
