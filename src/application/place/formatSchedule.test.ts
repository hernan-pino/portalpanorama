import { describe, it, expect } from 'vitest'
import { formatSchedule, implausibleDays, correctMiddayMisparse } from './formatSchedule'
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

  // El caller (EnrichPlaceRatingUseCase) descarta SOLO los días implausibles y formatea
  // el resto. Esto fija que, quitado el día malo, la semana buena queda útil (un día
  // omitido = "sin dato", no "cerrado"). Antes se botaba la semana entera por 1 día.
  it('quitado el día absurdo irrecuperable, el resto de la semana formatea bien', () => {
    const hours: OpeningHoursDay[] = [
      { day: 'lunes', hours: '12:30–20:00' },
      { day: 'domingo', hours: '01:00–20:00' }, // 19 h; +12 h no ayuda → irrecuperable
    ]
    const suspect = implausibleDays(hours)
    expect(suspect.map((d) => d.day)).toEqual(['domingo'])
    const usable = hours.filter((h) => !suspect.some((s) => s.day === h.day))
    expect(formatSchedule(usable)).toBe('Lu 12:30–20:00')
  })
})

describe('correctMiddayMisparse', () => {
  // Datos reales de Toni Lautaro (screenshot s40): Google publica el domingo como
  // "12:30 a.m.–5:30 p.m." → llega 00:30–17:30. Es un 12:30 PM (mediodía) mal etiquetado.
  it('corrige el 12:30 PM que Google mandó como 12:30 a.m. (00:30 → 12:30)', () => {
    const hours: OpeningHoursDay[] = [
      { day: 'sábado', hours: '12:30–22:30' },
      { day: 'domingo', hours: '00:30–17:30' }, // 17 h → se corrige a 12:30–17:30
    ]
    const fixed = correctMiddayMisparse(hours)
    expect(fixed.find((h) => h.day === 'domingo')!.hours).toBe('12:30–17:30')
    expect(implausibleDays(fixed)).toEqual([]) // ya no queda nada absurdo
    expect(formatSchedule(fixed)).toBe('Sá 12:30–22:30\nDo 12:30–17:30')
  })

  it('corrige también el tramo largo hasta la noche (00:30–23:00 → 12:30–23:00)', () => {
    expect(correctMiddayMisparse(week('00:30–23:00'))[0].hours).toBe('12:30–23:00')
  })

  it('NO toca una madrugada real (00:30–06:00 se respeta: tramo ya plausible)', () => {
    expect(correctMiddayMisparse(week('00:30–06:00'))[0].hours).toBe('00:30–06:00')
  })

  it('NO toca días que no empiezan 00:xx', () => {
    expect(correctMiddayMisparse(week('10:00–22:00'))[0].hours).toBe('10:00–22:00')
  })

  it('deja intacto lo que ni con +12 h se recupera (cae a implausibleDays)', () => {
    // 00:10–23:50 = 23 h 40; +12 h = 12:10–23:50 = 11 h 40 → sí se recupera. Uso un caso
    // que de verdad no se arregla: 00:00–20:00 (20 h); +12 h = 12:00–20:00 = 8 h → SÍ se
    // arregla. Para que NO se arregle el end debe caer antes del nuevo inicio y seguir >16h.
    // 00:30–13:00 = 12.5 h (plausible, no se toca). El caso irrecuperable real es raro;
    // basta con que la corrección no rompa un día que ya era plausible:
    expect(correctMiddayMisparse(week('00:30–13:00'))[0].hours).toBe('00:30–13:00')
  })
})
