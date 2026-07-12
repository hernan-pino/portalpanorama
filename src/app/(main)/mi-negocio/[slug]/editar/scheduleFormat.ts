// Horario estructurado ⇄ string canónico. El editor del dueño arma la semana con
// selectores por día; se serializa al MISMO formato que ya usan las ~400 fichas
// ("Lun a Vie 9:00–19:00 · Sáb 10:00–14:00 · Dom cerrado") y que la ficha pública
// renderiza tal cual. Sin schema nuevo: la fuente de verdad sigue siendo el string.

export interface TimeRange {
  from: string // 'HH:MM' 24h
  to: string
}
export type DaySchedule = { open: false } | { open: true; ranges: TimeRange[] }
export type WeekSchedule = DaySchedule[] // largo 7, orden Lun→Dom

export const DAY_ABBR = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const
const DASH = '–' // – en dash, el que usan las fichas

export function emptyWeek(): WeekSchedule {
  return Array.from({ length: 7 }, () => ({ open: false }) as DaySchedule)
}

// 'HH:MM' → '9:00' (sin cero a la izquierda en la hora, como las fichas).
function fmtTime(t: string): string {
  const [h, m] = t.split(':')
  return `${parseInt(h, 10)}:${m}`
}

function sameRanges(a: DaySchedule, b: DaySchedule): boolean {
  if (a.open !== b.open) return false
  if (!a.open || !b.open) return true // ambos cerrados
  if (a.ranges.length !== b.ranges.length) return false
  return a.ranges.every((r, i) => r.from === b.ranges[i].from && r.to === b.ranges[i].to)
}

function dayLabel(start: number, end: number): string {
  return start === end ? DAY_ABBR[start] : `${DAY_ABBR[start]} a ${DAY_ABBR[end]}`
}

// Serializa la semana al string canónico. Agrupa días consecutivos con el mismo
// horario ("Lun a Vie …"). Un día abierto sin rangos válidos se ignora (incompleto).
export function formatSchedule(week: WeekSchedule): string {
  const norm = week.map((d): DaySchedule =>
    d.open ? { open: true, ranges: d.ranges.filter((r) => r.from && r.to) } : { open: false },
  )
  const segments: string[] = []
  let i = 0
  while (i < 7) {
    const day = norm[i]
    // Saltar días abiertos sin rangos completos (no aportan info).
    if (day.open && day.ranges.length === 0) { i++; continue }
    let j = i
    while (j + 1 < 7 && !(norm[j + 1].open && (norm[j + 1] as { ranges: TimeRange[] }).ranges.length === 0) && sameRanges(norm[j + 1], day)) {
      j++
    }
    if (day.open) {
      const hours = day.ranges.map((r) => `${fmtTime(r.from)}${DASH}${fmtTime(r.to)}`).join(', ')
      segments.push(`${dayLabel(i, j)} ${hours}`)
    } else {
      segments.push(`${dayLabel(i, j)} cerrado`)
    }
    i = j + 1
  }
  return segments.join(' · ')
}

const DAY_INDEX: Record<string, number> = Object.fromEntries(DAY_ABBR.map((d, i) => [d.toLowerCase(), i]))

function parseTime(t: string): string | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h > 23 || min > 59) return null
  return `${String(h).padStart(2, '0')}:${m[2]}`
}

// string canónico → semana estructurada. Best-effort: si algo no calza devuelve
// null (el editor cae a "texto libre actual" como referencia). Round-trip estable
// con formatSchedule. Los días no mencionados quedan como cerrados.
export function parseSchedule(raw: string | null | undefined): WeekSchedule | null {
  if (!raw || !raw.trim()) return null
  const week = emptyWeek()
  const seen = new Array(7).fill(false)
  for (const segRaw of raw.split('·')) {
    const seg = segRaw.trim()
    if (!seg) continue
    // Días: "Lun" o "Lun a Vie" al inicio.
    const m = seg.match(/^(\p{L}{3})(?:\s+a\s+(\p{L}{3}))?\s+(.+)$/u)
    if (!m) return null
    const start = DAY_INDEX[m[1].toLowerCase()]
    const end = m[2] ? DAY_INDEX[m[2].toLowerCase()] : start
    if (start == null || end == null || end < start) return null
    const rest = m[3].trim()
    let day: DaySchedule
    if (/^cerrado$/i.test(rest)) {
      day = { open: false }
    } else {
      const ranges: TimeRange[] = []
      for (const part of rest.split(',')) {
        const rm = part.trim().match(/^(\d{1,2}:\d{2})\s*[–\-]\s*(\d{1,2}:\d{2})$/)
        if (!rm) return null
        const from = parseTime(rm[1])
        const to = parseTime(rm[2])
        if (!from || !to) return null
        ranges.push({ from, to })
      }
      if (ranges.length === 0) return null
      day = { open: true, ranges }
    }
    for (let d = start; d <= end; d++) {
      week[d] = day
      seen[d] = true
    }
  }
  if (!seen.some(Boolean)) return null
  return week
}
