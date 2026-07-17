import { describe, it, expect } from 'vitest'
import { formatSchedule, implausibleDays } from './formatSchedule'
import { OpeningHoursDay } from '../ports/PlaceRatingProvider'

const week = (hours: string): OpeningHoursDay[] =>
  (['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] as const).map((day) => ({
    day,
    hours,
  }))

describe('formatSchedule', () => {
  it('la semana uniforme queda en UNA sola línea', () => {
    expect(formatSchedule(week('10:00–20:30'))).toBe('Lu–Do 10:00–20:30')
  })

  it('pone el día cerrado en su lugar de la semana, no al final', () => {
    const hours = week('10:00–18:00').map((h) => (h.day === 'lunes' ? { ...h, hours: 'cerrado' } : h))
    expect(formatSchedule(hours)).toBe('Lu cerrado\nMa–Do 10:00–18:00')
  })

  it('agrupa días cerrados consecutivos como cualquier otro valor', () => {
    const hours = week('09:00–18:00').map((h) =>
      h.day === 'sábado' || h.day === 'domingo' ? { ...h, hours: 'cerrado' } : h,
    )
    expect(formatSchedule(hours)).toBe('Lu–Vi 09:00–18:00\nSá–Do cerrado')
  })

  it('una línea por grupo, en orden de semana', () => {
    const hours = week('09:00–18:00').map((h) => {
      if (h.day === 'sábado') return { ...h, hours: '10:00–14:00' }
      if (h.day === 'domingo') return { ...h, hours: 'cerrado' }
      return h
    })
    expect(formatSchedule(hours)).toBe('Lu–Vi 09:00–18:00\nSá 10:00–14:00\nDo cerrado')
  })

  it('el caso que motivó el cambio: cada día distinto queda escaneable', () => {
    // Jardín Pura Vida — era una frase corrida ilegible en una línea.
    const hours: OpeningHoursDay[] = [
      { day: 'lunes', hours: '11:30–20:30' },
      { day: 'martes', hours: '10:30–20:30' },
      { day: 'miércoles', hours: 'cerrado' },
      { day: 'jueves', hours: '10:30–15:30' },
      { day: 'viernes', hours: '11:00–21:00' },
      { day: 'sábado', hours: '11:00–21:30' },
      { day: 'domingo', hours: '10:30–21:00' },
    ]
    expect(formatSchedule(hours)).toBe(
      'Lu 11:30–20:30\nMa 10:30–20:30\nMi cerrado\nJu 10:30–15:30\nVi 11:00–21:00\nSá 11:00–21:30\nDo 10:30–21:00',
    )
  })

  it('conserva la jornada partida tal cual', () => {
    expect(formatSchedule(week('10:00–14:00, 16:00–20:00'))).toBe('Lu–Do 10:00–14:00, 16:00–20:00')
  })

  it('reconoce el 24/7', () => {
    expect(formatSchedule(week('24 horas'))).toBe('Abierto las 24 horas, todos los días.')
  })

  it('NO agrupa días no consecutivos con el mismo tramo', () => {
    // Lu y Mi abren igual, pero Ma abre distinto: no pueden colapsar en "Lu–Mi".
    const hours: OpeningHoursDay[] = [
      { day: 'lunes', hours: '10:00–18:00' },
      { day: 'martes', hours: '12:00–20:00' },
      { day: 'miércoles', hours: '10:00–18:00' },
    ]
    expect(formatSchedule(hours)).toBe('Lu 10:00–18:00\nMa 12:00–20:00\nMi 10:00–18:00')
  })

  it('devuelve undefined sin grilla, con grilla vacía o si todos los días están cerrados', () => {
    expect(formatSchedule(undefined)).toBeUndefined()
    expect(formatSchedule([])).toBeUndefined()
    expect(formatSchedule(week('cerrado'))).toBeUndefined()
  })

  it('ignora días que Google no trajo en vez de asumirlos cerrados', () => {
    const hours: OpeningHoursDay[] = [
      { day: 'lunes', hours: '10:00–18:00' },
      { day: 'martes', hours: '10:00–18:00' },
    ]
    expect(formatSchedule(hours)).toBe('Lu–Ma 10:00–18:00')
  })
})

describe('implausibleDays', () => {
  it('marca el tramo absurdo real de CH3 Gourmet (Google publica el viernes como 12:30 AM)', () => {
    const hours: OpeningHoursDay[] = [
      { day: 'jueves', hours: '12:30–20:10' },
      { day: 'viernes', hours: '00:30–21:10' }, // 20 h 40 corridas
      { day: 'sábado', hours: '12:30–21:10' },
    ]
    expect(implausibleDays(hours).map((d) => d.day)).toEqual(['viernes'])
  })

  it('NO marca un bar que cierra pasada la medianoche', () => {
    // 18:00–02:00 son 8 h, no 16: el tramo cruza el día, no es un error.
    expect(implausibleDays(week('18:00–02:00'))).toEqual([])
  })

  it('NO marca jornada partida, cerrado ni 24 horas', () => {
    expect(implausibleDays(week('10:00–14:00, 16:00–20:00'))).toEqual([])
    expect(implausibleDays(week('cerrado'))).toEqual([])
    expect(implausibleDays(week('24 horas'))).toEqual([])
  })

  it('NO marca una jornada larga pero real (16 h justas)', () => {
    expect(implausibleDays(week('08:00–00:00'))).toEqual([])
  })

  it('tolera una grilla ausente o texto que no se pudo normalizar', () => {
    expect(implausibleDays(undefined)).toEqual([])
    expect(implausibleDays(week('horario variable'))).toEqual([])
  })
})
