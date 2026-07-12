import { describe, expect, it } from 'vitest'
import { formatSchedule, parseSchedule, emptyWeek, type WeekSchedule } from './scheduleFormat'

const open = (from: string, to: string) => ({ open: true as const, ranges: [{ from, to }] })

describe('formatSchedule', () => {
  it('agrupa días consecutivos con el mismo horario', () => {
    const w: WeekSchedule = [
      open('09:00', '19:00'), open('09:00', '19:00'), open('09:00', '19:00'),
      open('09:00', '19:00'), open('09:00', '19:00'),
      open('10:00', '14:00'), { open: false },
    ]
    expect(formatSchedule(w)).toBe('Lun a Vie 9:00–19:00 · Sáb 10:00–14:00 · Dom cerrado')
  })

  it('quita el cero a la izquierda de la hora', () => {
    const w = emptyWeek()
    w[0] = open('09:30', '13:00')
    expect(formatSchedule(w)).toContain('9:30–13:00')
  })

  it('soporta turnos partidos', () => {
    const w = emptyWeek()
    w[0] = { open: true, ranges: [{ from: '13:00', to: '16:00' }, { from: '20:00', to: '23:00' }] }
    expect(formatSchedule(w)).toBe('Lun 13:00–16:00, 20:00–23:00 · Mar a Dom cerrado')
  })

  it('ignora días abiertos sin rangos completos', () => {
    const w = emptyWeek()
    w[0] = { open: true, ranges: [] }
    expect(formatSchedule(w)).toBe('Mar a Dom cerrado')
  })
})

describe('parseSchedule', () => {
  it('devuelve null para texto vacío o no canónico', () => {
    expect(parseSchedule('')).toBeNull()
    expect(parseSchedule('todos los días de repente')).toBeNull()
  })

  it('round-trip estable con formatSchedule', () => {
    const cases = [
      'Lun a Vie 9:00–19:00 · Sáb 10:00–14:00 · Dom cerrado',
      'Lun a Dom 8:00–22:00',
      'Lun 13:00–16:00, 20:00–23:00 · Mar a Dom cerrado',
    ]
    for (const s of cases) {
      const parsed = parseSchedule(s)
      expect(parsed).not.toBeNull()
      expect(formatSchedule(parsed!)).toBe(s)
    }
  })

  it('los días no mencionados quedan cerrados', () => {
    const parsed = parseSchedule('Lun a Vie 9:00–18:00')
    expect(parsed).not.toBeNull()
    expect(parsed![5]).toEqual({ open: false })
    expect(parsed![6]).toEqual({ open: false })
  })
})
