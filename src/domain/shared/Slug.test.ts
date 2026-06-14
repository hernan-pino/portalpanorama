import { describe, it, expect } from 'vitest'
import { Slug, InvalidSlugError } from './Slug'

describe('Slug.generate', () => {
  it('pasa a minúsculas y une con guiones', () => {
    expect(Slug.generate('Bar de Prueba').value).toBe('bar-de-prueba')
  })

  it('quita acentos y convierte la ñ', () => {
    expect(Slug.generate('Café Ñuñoa').value).toBe('cafe-nunoa')
  })

  it('descarta símbolos y colapsa espacios/guiones repetidos', () => {
    expect(Slug.generate('  ¡Hola!!  --  Mundo  ').value).toBe('hola-mundo')
  })

  it('un nombre sin caracteres válidos lanza error', () => {
    expect(() => Slug.generate('¡!¿?')).toThrow(InvalidSlugError)
  })
})

describe('Slug.fromExisting', () => {
  it('acepta un slug ya válido', () => {
    expect(Slug.fromExisting('barrio-italia').value).toBe('barrio-italia')
  })

  it('rechaza mayúsculas, espacios o guiones al borde', () => {
    expect(() => Slug.fromExisting('Barrio Italia')).toThrow(InvalidSlugError)
    expect(() => Slug.fromExisting('-italia')).toThrow(InvalidSlugError)
    expect(() => Slug.fromExisting('italia-')).toThrow(InvalidSlugError)
  })
})

describe('Slug.equals', () => {
  it('compara por valor', () => {
    expect(Slug.fromExisting('a-b').equals(Slug.generate('A B'))).toBe(true)
    expect(Slug.fromExisting('a-b').equals(Slug.fromExisting('a-c'))).toBe(false)
  })
})
