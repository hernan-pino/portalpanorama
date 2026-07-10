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

// El prior por categoría corrige el sesgo del global: las categorías de nota alta
// (juegos ~4,7) eran castigadas y las duras regaladas al compararlas todas contra
// el mismo ~4,5. El guard evita que una categoría chica imponga un prior ruidoso.
describe('Score.prior', () => {
  it('usa el promedio de la categoría cuando la muestra alcanza', () => {
    expect(Score.prior({ average: 4.7, ratedCount: 15 }, 4.5)).toBe(4.7)
    expect(Score.prior({ average: 4.1, ratedCount: 200 }, 4.5)).toBe(4.1)
  })

  it('cae al promedio global si la categoría tiene menos de MIN_CATEGORY_SAMPLE lugares con rating', () => {
    expect(Score.prior({ average: 5, ratedCount: 14 }, 4.5)).toBe(4.5)
    expect(Score.prior({ average: 5, ratedCount: 1 }, 4.5)).toBe(4.5)
  })

  it('cae al promedio global si la categoría no tiene estadística', () => {
    expect(Score.prior(null, 4.5)).toBe(4.5)
    expect(Score.prior(undefined, 4.5)).toBe(4.5)
  })

  it('el umbral del guard queda documentado en la constante', () => {
    expect(Score.MIN_CATEGORY_SAMPLE).toBe(15)
  })

  it('integrado con bayesian: en una categoría de nota alta el prior ya no castiga hacia el global', () => {
    // Juegos (promedio 4.8): con el global 4.5 un 4.6/30 era arrastrado hacia abajo;
    // con el prior de su categoría queda comparado contra sus pares.
    const conPriorCategoria = Score.bayesian(4.6, 30, Score.prior({ average: 4.8, ratedCount: 40 }, 4.5))
    const conPriorGlobal = Score.bayesian(4.6, 30, 4.5)
    expect(conPriorCategoria).toBeGreaterThan(conPriorGlobal)
  })
})
