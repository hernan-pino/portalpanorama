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

// Google a veces publica un "12:30 PM" (mediodía) como "12:30 a.m." — el clásico error de
// 12 h del meridiano (12 PM = mediodía, no medianoche). Nuestro parser lo transcribe fiel a
// 00:30, pero el dato de origen está malo. Se manifiesta como un día que abre 00:xx con un
// tramo larguísimo (Toni Lautaro, domingo "12:30 a.m.–5:30 p.m." → 00:30–17:30 = 17 h).
// Cuando reinterpretar ese inicio como 12:xx (mediodía) vuelve el tramo plausible, es casi
// seguro el arreglo correcto: un local que de verdad abre a las 00:30 cierra de madrugada,
// no a media tarde. SOLO toca ese caso (inicio 00:xx + tramo implausible que se arregla con
// +12 h); todo lo demás queda intacto, incluida la madrugada real (00:30–06:00 se respeta).
export function correctMiddayMisparse(hours: OpeningHoursDay[] | undefined): OpeningHoursDay[] {
  if (!hours) return []
  return hours.map((h) => {
    const m = h.hours.match(/^00:(\d{2})–(\d{2}):(\d{2})$/)
    if (!m) return h // no es un día de un solo tramo que empiece 00:xx
    if (spanMinutes(h.hours) <= MAX_PLAUSIBLE_SPAN_MINUTES) return h // 00:xx real, no tocar
    const corrected = `12:${m[1]}–${m[2]}:${m[3]}`
    if (spanMinutes(corrected) > MAX_PLAUSIBLE_SPAN_MINUTES) return h // no se recupera → cae a implausibleDays
    return { ...h, hours: corrected }
  })
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
//
// Formato: UNA LÍNEA POR GRUPO de días consecutivos con el mismo tramo, en orden de
// semana ("Lu–Vi 09:00–18:00\nSá 10:00–14:00\nDo cerrado"). Degrada solo: si toda la
// semana abre igual queda en una línea; si cada día es distinto, quedan 7 líneas cortas.
// Una línea corrida se volvía ilegible justo en ese caso (feedback del usuario, s37).
// El día cerrado va EN SU LUGAR de la semana, no relegado al final: se escanea la
// columna de días de corrido. Por eso "cerrado" es un valor más y lo agrupa el mismo
// algoritmo, sin caso especial.
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
  // Solo días cerrados: dato inútil, que lo vea un humano.
  if (week.every((d) => byDay.get(d) === 'cerrado')) return undefined

  // Agrupa días CONSECUTIVOS con el mismo valor ("cerrado" incluido).
  const groups: { days: OpeningHoursDay['day'][]; hours: string }[] = []
  for (const day of week) {
    const value = byDay.get(day)!
    const last = groups[groups.length - 1]
    const isConsecutive =
      last && ORDER.indexOf(day) === ORDER.indexOf(last.days[last.days.length - 1]) + 1
    if (last && last.hours === value && isConsecutive) last.days.push(day)
    else groups.push({ days: [day], hours: value })
  }

  return groups
    .map((g) => {
      const label =
        g.days.length === 1
          ? ABBR[g.days[0]]
          : `${ABBR[g.days[0]]}–${ABBR[g.days[g.days.length - 1]]}`
      return `${label} ${g.hours}`
    })
    .join('\n')
}
