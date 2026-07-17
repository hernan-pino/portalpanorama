import { OpeningHoursDay } from '../ports/PlaceRatingProvider'

// Convierte la grilla semanal de un PlaceRatingProvider al string de `schedule`,
// siguiendo la convención de las fichas cargadas a mano: "Lu–Do 10:00–20:30 h",
// "Ma–Do 10:00–18:00 h. Lunes cerrado.".
//
// Ojo: `schedule` es texto libre EDITORIAL. Google solo da la grilla; los matices
// ("último ingreso 17:15", "puede variar por sucursal") los escribe un humano. Esto
// genera la base correcta, no la ficha final.

const ABBR: Record<OpeningHoursDay['day'], string> = {
  lunes: 'Lu',
  martes: 'Ma',
  miércoles: 'Mi',
  jueves: 'Ju',
  viernes: 'Vi',
  sábado: 'Sá',
  domingo: 'Do',
}

const ORDER: OpeningHoursDay['day'][] = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
]

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Un tramo de más de 16 h corridas no es el horario real de un local: los 24/7 llegan
// como "24 horas". Casi siempre es dato malo del proveedor — CH3 Gourmet publica el
// viernes como "12:30 AM to 9:10 PM" (00:30–21:10) cuando el resto de la semana abre
// a las 12:30 PM. No se corrige a mano (no sabemos cuál es el correcto): se marca.
const MAX_PLAUSIBLE_SPAN_MINUTES = 16 * 60

// Días cuyo horario no es creíble. El caller decide qué hacer; acá no se inventa nada.
export function implausibleDays(hours: OpeningHoursDay[] | undefined): OpeningHoursDay[] {
  if (!hours) return []
  return hours.filter((h) => spanMinutes(h.hours) > MAX_PLAUSIBLE_SPAN_MINUTES)
}

// Minutos del tramo más largo de un día ("10:00–14:00, 16:00–20:00" → 240). Devuelve
// 0 para "cerrado", "24 horas" o cualquier texto que no se haya podido normalizar.
function spanMinutes(hours: string): number {
  if (hours === 'cerrado' || hours === '24 horas') return 0
  let longest = 0
  for (const range of hours.split(',')) {
    const m = range.trim().match(/^(\d{2}):(\d{2})–(\d{2}):(\d{2})$/)
    if (!m) continue
    const start = Number(m[1]) * 60 + Number(m[2])
    const end = Number(m[3]) * 60 + Number(m[4])
    // Cierre pasada la medianoche (22:00–02:00): el tramo cruza el día.
    const span = end >= start ? end - start : 24 * 60 - start + end
    longest = Math.max(longest, span)
  }
  return longest
}

// Devuelve undefined cuando no hay grilla utilizable: el caller decide (no inventamos
// un horario ni escribimos un string vacío en la ficha).
export function formatSchedule(hours: OpeningHoursDay[] | undefined): string | undefined {
  if (!hours || hours.length === 0) return undefined

  // Un solo valor por día, en orden de semana. Si Google no trae un día, se omite
  // (no se asume "cerrado": ausencia de dato ≠ cerrado).
  const byDay = new Map<OpeningHoursDay['day'], string>()
  for (const h of hours) if (!byDay.has(h.day)) byDay.set(h.day, h.hours.trim())
  const week = ORDER.filter((d) => byDay.has(d))
  if (week.length === 0) return undefined

  if (week.every((d) => byDay.get(d) === '24 horas')) {
    return 'Abierto las 24 horas, todos los días.'
  }

  const closed = week.filter((d) => byDay.get(d) === 'cerrado')
  const open = week.filter((d) => byDay.get(d) !== 'cerrado')
  if (open.length === 0) return undefined // solo días cerrados: dato inútil, que lo vea un humano

  // Agrupa días CONSECUTIVOS (en el orden de la semana) con el mismo tramo.
  const groups: { days: OpeningHoursDay['day'][]; hours: string }[] = []
  for (const day of open) {
    const value = byDay.get(day)!
    const last = groups[groups.length - 1]
    const isConsecutive =
      last && ORDER.indexOf(day) === ORDER.indexOf(last.days[last.days.length - 1]) + 1
    if (last && last.hours === value && isConsecutive) last.days.push(day)
    else groups.push({ days: [day], hours: value })
  }

  const parts = groups.map((g) => {
    const label =
      g.days.length === 1
        ? ABBR[g.days[0]]
        : `${ABBR[g.days[0]]}–${ABBR[g.days[g.days.length - 1]]}`
    return g.hours === '24 horas' ? `${label} 24 horas` : `${label} ${g.hours} h`
  })

  let out = parts.join('. ')
  if (closed.length > 0) {
    // Solo el primero va en mayúscula: abre la frase ("Sábado y domingo cerrado").
    const list =
      closed.length === 1
        ? capitalize(closed[0])
        : `${closed.slice(0, -1).join(', ')} y ${closed[closed.length - 1]}`
    out += `. ${capitalize(list)} cerrado`
  }
  return `${out}.`
}
