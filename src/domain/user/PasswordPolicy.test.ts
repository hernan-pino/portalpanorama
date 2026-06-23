import { describe, it, expect } from 'vitest'
import { evaluatePassword } from './PasswordPolicy'

describe('evaluatePassword', () => {
  it('rechaza por debajo del mínimo de longitud', () => {
    const r = evaluatePassword('ab1')
    expect(r.acceptable).toBe(false)
    expect(r.issues).toContain('Al menos 8 caracteres')
  })

  it('exige letra y número', () => {
    expect(evaluatePassword('12345678').issues).toContain('Al menos una letra')
    expect(evaluatePassword('abcdefgh').issues).toContain('Al menos un número')
  })

  it('acepta una contraseña con 8+ caracteres, letra y número', () => {
    const r = evaluatePassword('abcd1234')
    expect(r.acceptable).toBe(true)
    expect(r.issues).toHaveLength(0)
  })

  it('una contraseña no aceptable nunca pasa de score 1', () => {
    // larga y con símbolos pero sin número → no aceptable
    expect(evaluatePassword('abcdEFGH!@#$').acceptable).toBe(false)
    expect(evaluatePassword('abcdEFGH!@#$').score).toBeLessThanOrEqual(1)
  })

  it('sube el score con longitud, mayúsculas/minúsculas y símbolos', () => {
    expect(evaluatePassword('abcd1234').score).toBeLessThan(evaluatePassword('Abcd1234!xyz').score)
    expect(evaluatePassword('Abcd1234!xyz').score).toBe(4)
  })

  it('vacía da score 0', () => {
    expect(evaluatePassword('').score).toBe(0)
  })
})
