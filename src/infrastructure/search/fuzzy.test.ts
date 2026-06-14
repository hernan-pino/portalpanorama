import { describe, it, expect } from 'vitest'
import { normalize, fuzzyScore, fuzzyMatches, MATCH_THRESHOLD } from './fuzzy'

describe('normalize', () => {
  it('baja a minúsculas, quita acentos y colapsa espacios', () => {
    expect(normalize('  Café   CON  Leche ')).toBe('cafe con leche')
  })
})

describe('fuzzyScore — las 3 formas que pide el producto', () => {
  it('prefijo exacto puntúa máximo (1.0)', () => {
    expect(fuzzyScore('Café Bar', 'caf')).toBe(1)
  })

  it('insensible a acentos: "cafe" matchea "Café"', () => {
    expect(fuzzyScore('Café', 'cafe')).toBe(1)
  })

  it('substring que no es prefijo puntúa alto pero menos (0.9)', () => {
    expect(fuzzyScore('Bar Café', 'cafe')).toBe(0.9)
  })

  it('tolera un typo en consultas de 4+ letras ("cafi" ≈ "cafetería")', () => {
    const score = fuzzyScore('cafetería', 'cafi')
    expect(score).toBeGreaterThanOrEqual(MATCH_THRESHOLD)
    expect(score).toBeLessThan(0.9)
  })

  it('no tolera typos en consultas muy cortas (<4 letras)', () => {
    expect(fuzzyScore('cab', 'caz')).toBe(0)
  })

  it('texto sin relación devuelve 0', () => {
    expect(fuzzyScore('restaurante', 'piscina')).toBe(0)
  })

  it('consulta o texto vacío devuelve 0', () => {
    expect(fuzzyScore('', 'cafe')).toBe(0)
    expect(fuzzyScore('cafe', '')).toBe(0)
  })
})

describe('fuzzyMatches', () => {
  it('pasa el umbral en un match razonable', () => {
    expect(fuzzyMatches('Café', 'cafe')).toBe(true)
    expect(fuzzyMatches('cafetería', 'cafi')).toBe(true)
  })

  it('no pasa el umbral sin relación', () => {
    expect(fuzzyMatches('piscina municipal', 'sushi')).toBe(false)
  })
})
