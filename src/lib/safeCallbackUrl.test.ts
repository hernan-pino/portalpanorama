import { describe, expect, it } from 'vitest'
import { safeCallbackUrl } from './safeCallbackUrl'

describe('safeCallbackUrl — defensa anti open-redirect', () => {
  const FB = '/explorar'

  it('acepta rutas internas relativas', () => {
    expect(safeCallbackUrl('/reclamar/mi-local', FB)).toBe('/reclamar/mi-local')
    expect(safeCallbackUrl('/mi-negocio', FB)).toBe('/mi-negocio')
  })

  it('cae al fallback si no hay valor', () => {
    expect(safeCallbackUrl(null, FB)).toBe(FB)
    expect(safeCallbackUrl(undefined, FB)).toBe(FB)
    expect(safeCallbackUrl('', FB)).toBe(FB)
  })

  it('rechaza URLs externas y protocol-relative', () => {
    expect(safeCallbackUrl('https://evil.tld', FB)).toBe(FB)
    expect(safeCallbackUrl('//evil.tld', FB)).toBe(FB)
    expect(safeCallbackUrl('http://evil.tld/x', FB)).toBe(FB)
  })

  it('rechaza esquemas peligrosos y rutas que no empiezan con /', () => {
    expect(safeCallbackUrl('javascript:alert(1)', FB)).toBe(FB)
    expect(safeCallbackUrl('reclamar/mi-local', FB)).toBe(FB)
  })
})
