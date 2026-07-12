'use client'
import { useState } from 'react'
import {
  DAY_ABBR,
  emptyWeek,
  formatSchedule,
  type TimeRange,
  type WeekSchedule,
} from './scheduleFormat'

const MAX_SHIFTS = 2
const DEFAULT_RANGE: TimeRange = { from: '09:00', to: '18:00' }

// Editor de horario por día. Serializa al string canónico en un <input hidden
// name="schedule"> dentro del form. Si el horario actual no calza con el formato
// (legacy en texto libre), arranca sin tocar y lo conserva hasta que el dueño edite.
export function OwnerSchedule({
  parsed,
  rawFallback,
}: {
  parsed: WeekSchedule | null
  rawFallback: string
}) {
  const [week, setWeek] = useState<WeekSchedule>(parsed ?? emptyWeek())
  const [touched, setTouched] = useState(false)
  const parseFailed = parsed === null && rawFallback.trim() !== ''

  // Sin tocar: conserva el string original (no pisa legacy ni "cierra" sin querer).
  // Tocado: emite el formato canónico armado por el editor.
  const hiddenValue = touched ? formatSchedule(week) : rawFallback

  function edit(mut: (w: WeekSchedule) => WeekSchedule) {
    setTouched(true)
    setWeek((w) => mut(w))
  }
  function setDay(i: number, day: WeekSchedule[number]) {
    edit((w) => w.map((d, idx) => (idx === i ? day : d)))
  }
  function toggleOpen(i: number, open: boolean) {
    setDay(i, open ? { open: true, ranges: [{ ...DEFAULT_RANGE }] } : { open: false })
  }
  function setRange(i: number, ri: number, field: 'from' | 'to', value: string) {
    const day = week[i]
    if (!day.open) return
    setDay(i, { open: true, ranges: day.ranges.map((r, idx) => (idx === ri ? { ...r, [field]: value } : r)) })
  }
  function addShift(i: number) {
    const day = week[i]
    if (!day.open || day.ranges.length >= MAX_SHIFTS) return
    setDay(i, { open: true, ranges: [...day.ranges, { ...DEFAULT_RANGE }] })
  }
  function removeShift(i: number, ri: number) {
    const day = week[i]
    if (!day.open) return
    setDay(i, { open: true, ranges: day.ranges.filter((_, idx) => idx !== ri) })
  }

  return (
    <div className="osched">
      <input type="hidden" name="schedule" value={hiddenValue} />

      {parseFailed && (
        <p className="osched__legacy">
          Tu horario actual está en texto libre: <em>«{rawFallback}»</em>. Ajusta los días abajo
          para estandarizarlo (se reemplaza al guardar).
        </p>
      )}

      <ul className="osched__list">
        {DAY_ABBR.map((label, i) => {
          const day = week[i]
          return (
            <li key={label} className="osched__day">
              <span className="osched__name">{label}</span>
              <label className="osched__toggle">
                <input type="checkbox" checked={day.open}
                  onChange={(e) => toggleOpen(i, e.target.checked)} />
                <span>{day.open ? 'Abierto' : 'Cerrado'}</span>
              </label>

              {day.open && (
                <div className="osched__ranges">
                  {day.ranges.map((r, ri) => (
                    <div key={ri} className="osched__range">
                      <input type="time" className="form-input osched__time" value={r.from}
                        onChange={(e) => setRange(i, ri, 'from', e.target.value)} aria-label="Apertura" />
                      <span className="osched__dash">–</span>
                      <input type="time" className="form-input osched__time" value={r.to}
                        onChange={(e) => setRange(i, ri, 'to', e.target.value)} aria-label="Cierre" />
                      {ri > 0 && (
                        <button type="button" className="osched__x" onClick={() => removeShift(i, ri)}
                          aria-label="Quitar turno">✕</button>
                      )}
                    </div>
                  ))}
                  {day.ranges.length < MAX_SHIFTS && (
                    <button type="button" className="osched__add" onClick={() => addShift(i)}>
                      + Agregar turno
                    </button>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
