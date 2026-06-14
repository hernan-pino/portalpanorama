import { describe, it, expect } from 'vitest'
import { Email, InvalidEmailError } from './Email'

describe('Email.create', () => {
  it('normaliza recortando espacios y bajando a minúsculas', () => {
    expect(Email.create('  Hola@Ejemplo.CL  ').value).toBe('hola@ejemplo.cl')
  })

  it('acepta direcciones válidas', () => {
    expect(Email.create('la.bitacore@gmail.com').value).toBe('la.bitacore@gmail.com')
  })

  it.each(['sin-arroba', 'a@b', 'a@@b.cl', 'con espacio@x.cl', '@dominio.cl', 'a@b.'])(
    'rechaza "%s"',
    (raw) => {
      expect(() => Email.create(raw)).toThrow(InvalidEmailError)
    },
  )
})

describe('Email.equals', () => {
  it('compara tras normalizar (case/espacios no importan)', () => {
    expect(Email.create('A@B.CL').equals(Email.create(' a@b.cl '))).toBe(true)
    expect(Email.create('a@b.cl').equals(Email.create('c@d.cl'))).toBe(false)
  })
})
