import { describe, it, expect } from 'vitest'
import { normalize, fuzzyScore, fuzzyMatches, tokenizeQuery, MATCH_THRESHOLD } from './fuzzy'

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

describe('tokenizeQuery — frases en lenguaje natural', () => {
  it('descarta stopwords y genéricas del dominio', () => {
    expect(tokenizeQuery('lugares para ir con niños')).toEqual(['ninos'])
    expect(tokenizeQuery('panoramas para una primera cita')).toEqual(['primera', 'cita'])
  })

  it('conserva los términos con contenido (rubro + comuna)', () => {
    expect(tokenizeQuery('ramen en Providencia')).toEqual(['ramen', 'providencia'])
  })

  it('normaliza acentos y mayúsculas en cada término', () => {
    expect(tokenizeQuery('Café DE especialidad')).toEqual(['cafe', 'especialidad'])
  })

  it('si la consulta es puro relleno, cae a la frase normalizada entera', () => {
    expect(tokenizeQuery('para la de')).toEqual(['para la de'])
  })

  it('consulta vacía devuelve []', () => {
    expect(tokenizeQuery('   ')).toEqual([])
  })
})
