import { describe, it, expect } from 'vitest'
import { haversineKm, formatDistance, describeDistance } from './geo'

// Referencias reales de Santiago para que las distancias sean verificables a mano.
const PLAZA_ARMAS = { lat: -33.4372, lng: -70.6506 }
const COSTANERA_CENTER = { lat: -33.4175, lng: -70.6062 }

describe('haversineKm', () => {
  it('mide la distancia conocida entre Plaza de Armas y Costanera Center (~4,6 km)', () => {
    const km = haversineKm(PLAZA_ARMAS, COSTANERA_CENTER)
    expect(km).toBeGreaterThan(4.3)
    expect(km).toBeLessThan(4.9)
  })

  it('da 0 para el mismo punto', () => {
    expect(haversineKm(PLAZA_ARMAS, PLAZA_ARMAS)).toBe(0)
  })

  it('es simétrica', () => {
    expect(haversineKm(PLAZA_ARMAS, COSTANERA_CENTER)).toBeCloseTo(
      haversineKm(COSTANERA_CENTER, PLAZA_ARMAS),
      10,
    )
  })
})

describe('formatDistance', () => {
  it('usa metros redondeados a 10 bajo 1 km', () => {
    expect(formatDistance(0.347)).toBe('a 350 m de ti')
  })

  it('usa un decimal con coma chilena entre 1 y 10 km', () => {
    expect(formatDistance(5.47)).toBe('a 5,5 km de ti')
  })

  it('redondea a entero sobre 10 km', () => {
    expect(formatDistance(14.3)).toBe('a 14 km de ti')
  })
})

describe('describeDistance', () => {
  it('bajo 1,5 km muestra el tiempo caminando', () => {
    const d = describeDistance(0.8)
    expect(d.walking).toBe(true)
    // 2 min fijos + 0,8 km × 1,4 de rodeo ÷ 5 km/h ≈ 15,4 min
    expect(d.text).toBe('a 15 min a pie')
  })

  // El caso que destapó la calibración vieja: 130 m en línea recta daban "2 min"
  // cuando caminarlo tomaba ~5. Los minutos fijos (esquina, cruce, semáforo) pesan
  // más que la caminata a esta escala.
  it('no subestima las distancias muy cortas', () => {
    expect(describeDistance(0.13).text).toBe('a 4 min a pie')
  })

  it('nunca baja del piso fijo, por muy pegado que esté', () => {
    expect(describeDistance(0.001).text).toBe('a 2 min a pie')
  })

  it('desde 1,5 km vuelve a la distancia en línea recta', () => {
    const d = describeDistance(1.5)
    expect(d.walking).toBe(false)
    expect(d.text).toBe('a 1,5 km de ti')
  })

  it('a distancias largas no promete caminata', () => {
    expect(describeDistance(5.5)).toEqual({ text: 'a 5,5 km de ti', walking: false })
  })
})
