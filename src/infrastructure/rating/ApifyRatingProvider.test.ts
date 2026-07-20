import { describe, it, expect } from 'vitest'
import { extractParking } from './ApifyRatingProvider'
import { ParkingOption } from '@domain/place/ParkingOption'

// Todos los casos usan payloads REALES capturados del actor de Apify (language:'es')
// sobre lugares del catálogo. El vocabulario de Google no se puede adivinar: si estos
// tests se caen, es que el proveedor cambió sus etiquetas y hay que re-sondear.
const seccion = (...etiquetas: string[]) => ({
  additionalInfo: { Estacionamiento: etiquetas.map((e) => ({ [e]: true })) },
})

describe('extractParking — dónde estacionar, desde Google', () => {
  it('devuelve undefined si no viene additionalInfo', () => {
    expect(extractParking({})).toBeUndefined()
  })

  it('devuelve undefined si no hay sección "Estacionamiento" (Galería Patricia Ready)', () => {
    expect(extractParking({ additionalInfo: { Pagos: [{ 'Tarjetas de crédito': true }] } })).toBeUndefined()
  })

  // La trampa que motivó acotarse a la sección: Mall Sport NO tiene sección de
  // estacionamiento, pero sí "Estacionamiento accesible…" bajo Accesibilidad. Contarlo
  // haría aparecer un dato que Google nunca dio.
  it('IGNORA "Estacionamiento accesible" de la sección Accesibilidad (Mall Sport)', () => {
    const item = {
      additionalInfo: {
        Accesibilidad: [
          { 'Entrada accesible para personas en silla de ruedas': true },
          { 'Estacionamiento accesible para personas en silla de ruedas': true },
        ],
      },
    }
    expect(extractParking(item)).toBeUndefined()
  })

  it('distingue calle gratis de calle pagada (Ramen Ryoma)', () => {
    const r = extractParking(
      seccion(
        'Es un poco difícil encontrar espacio',
        'Estacionamiento gratuito en la calle',
        'Estacionamiento pagado en la calle',
      ),
    )
    expect(r).toEqual([ParkingOption.STREET_FREE, ParkingOption.STREET_PAID, ParkingOption.HARD])
  })

  it('tolera el typo de Google: "Garage de stacionamiento gratuito" (Osaka)', () => {
    const r = extractParking(
      seccion(
        'Hay suficiente espacio',
        'Estacionamiento pagado',
        'Garage de estacionamiento pagado',
        'Garage de stacionamiento gratuito', // sic
      ),
    )
    expect(r).toContain(ParkingOption.OWN_FREE)
    expect(r).toContain(ParkingOption.OWN_PAID)
  })

  // El genérico "Estacionamiento gratuito" es un roll-up: si ya sabemos que es en la
  // calle, mostrarlo además como "gratis" a secas repetiría el dato en la ficha.
  it('suprime el genérico cuando ya hay un específico del mismo costo (Doña Tina)', () => {
    const r = extractParking(
      seccion('Hay suficiente espacio', 'Estacionamiento gratuito', 'Estacionamiento gratuito en la calle'),
    )
    expect(r).toEqual([ParkingOption.STREET_FREE, ParkingOption.EASY])
    expect(r).not.toContain(ParkingOption.FREE)
  })

  it('conserva el genérico cuando es la única pista del costo (Matsuri)', () => {
    const r = extractParking(seccion('Hay suficiente espacio', 'Estacionamiento gratuito'))
    expect(r).toEqual([ParkingOption.FREE, ParkingOption.EASY])
  })

  it('"en el lugar" sin precio hereda el costo del genérico que lo acompaña (Boulevard)', () => {
    const r = extractParking(
      seccion(
        'Hay suficiente espacio',
        'Estacionamiento en el lugar',
        'Estacionamiento gratuito',
        'Estacionamiento gratuito en la calle',
        'Servicio de estacionamiento',
      ),
    )
    expect(r).toEqual([
      ParkingOption.OWN_FREE,
      ParkingOption.STREET_FREE,
      ParkingOption.VALET,
      ParkingOption.EASY,
    ])
  })

  it('un valor false es "no tiene", no "tiene"', () => {
    const item = { additionalInfo: { Estacionamiento: [{ 'Estacionamiento gratuito': false }] } }
    expect(extractParking(item)).toBeUndefined()
  })

  it('el orden es estable (el del enum), no el de llegada', () => {
    const a = extractParking(seccion('Hay suficiente espacio', 'Estacionamiento gratuito en la calle'))
    const b = extractParking(seccion('Estacionamiento gratuito en la calle', 'Hay suficiente espacio'))
    expect(a).toEqual(b)
  })

  it('no explota con basura en la sección', () => {
    expect(extractParking({ additionalInfo: { Estacionamiento: [null, 'texto', 42] } })).toBeUndefined()
    expect(extractParking({ additionalInfo: { Estacionamiento: 'no es lista' } })).toBeUndefined()
  })
})
