import {
  PlaceRatingProvider,
  RatingQuery,
  RatingResult,
  RatingLookupError,
  OpeningHoursDay,
} from '@application/ports/PlaceRatingProvider'

// Adapter de reputación sobre Apify (actor "Google Maps Scraper", compass/crawler-
// google-places). Resuelve nombre+comuna → rating/reseñas/place_id + fotos del lugar.
// Se llama en modo SÍNCRONO (run-sync-get-dataset-items): lanza el actor, espera y
// devuelve los items del dataset en la misma request. El token solo se lee acá
// (infraestructura), nunca en dominio/aplicación.
//
// Cambiar de proveedor = reescribir solo este archivo: el port PlaceRatingProvider
// es el contrato estable que ven el use case y el script.

const ACTOR = 'compass~crawler-google-places' // "~" reemplaza al "/" del id del actor
const ENDPOINT = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items`
const TIMEOUT_MS = 120_000 // un run puede tardar; ~2 min de margen
const MAX_PHOTOS = 10

export class ApifyRatingProvider implements PlaceRatingProvider {
  // Una o más cuentas de Apify, en orden de uso. Permite doblar el free tier: cuando
  // la primera agota su cuota mensual (o el token es rechazado), rota sola a la
  // siguiente. `tokenIndex` recuerda en cuál vamos para no re-pegarle a una agotada.
  private readonly tokens: string[]
  private tokenIndex = 0

  constructor(tokens?: string[]) {
    const list = (tokens ?? [process.env.APIFY_TOKEN, process.env.APIFY_TOKEN_2])
      .map((t) => t?.trim())
      .filter((t): t is string => !!t)
    if (list.length === 0) {
      throw new RatingLookupError('Falta APIFY_TOKEN en el entorno.')
    }
    this.tokens = list
  }

  async lookup(query: RatingQuery): Promise<RatingResult | null> {
    const input = this.buildInput(query)
    const items = await this.runActor(input)
    const first = items[0]
    if (!first) return null
    return this.toResult(first)
  }

  // Si conocemos el place_id, búsqueda exacta por id (sin matching difuso). Si no,
  // búsqueda por texto "Nombre, Comuna, Chile" acotada a 1 resultado.
  private buildInput(query: RatingQuery): Record<string, unknown> {
    const base = {
      language: 'es',
      maxImages: MAX_PHOTOS,
      maxReviews: 0, // no traemos reseñas individuales, solo el agregado
      scrapeReviewsPersonalData: false,
    }
    if (query.knownPlaceId) {
      return { ...base, placeIds: [query.knownPlaceId], maxCrawledPlacesPerSearch: 1 }
    }
    // Incluir la dirección fija la sucursal correcta en marcas multi-local.
    const terms = [query.name, query.address, query.commune, 'Chile'].filter(Boolean).join(', ')
    return { ...base, searchStringsArray: [terms], maxCrawledPlacesPerSearch: 1 }
  }

  private async runActor(input: Record<string, unknown>): Promise<ApifyPlaceItem[]> {
    let lastError: RatingLookupError | null = null
    // Arranca desde la cuenta actual; si una agota cuota (402) o rechaza el token
    // (401/403), avanza el puntero y prueba la siguiente. No reintenta las ya agotadas.
    for (let idx = this.tokenIndex; idx < this.tokens.length; idx++) {
      let res: Response
      try {
        res = await fetch(`${ENDPOINT}?token=${encodeURIComponent(this.tokens[idx])}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(input),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
      } catch {
        // Timeout/red: no es problema de la cuenta, no tiene sentido rotar.
        throw new RatingLookupError('No se pudo conectar con Apify (timeout o red).')
      }

      // Token rechazado (401/403) o cuota/plan agotado (402): rota a la siguiente cuenta.
      if (res.status === 401 || res.status === 403 || res.status === 402) {
        this.tokenIndex = idx + 1
        lastError = new RatingLookupError(
          `Apify cuenta #${idx + 1}: token rechazado o cuota agotada (HTTP ${res.status}).`,
        )
        if (this.tokenIndex < this.tokens.length) {
          console.warn(`⚠️  ${lastError.message} → cambiando a la cuenta #${idx + 2}.`)
        }
        continue
      }
      if (!res.ok) {
        throw new RatingLookupError(`Apify respondió con error (HTTP ${res.status}).`)
      }
      const body = (await res.json()) as unknown
      if (!Array.isArray(body)) {
        throw new RatingLookupError('Respuesta inesperada de Apify (no es una lista).')
      }
      this.tokenIndex = idx // pega a la cuenta que funcionó para las siguientes llamadas
      return body as ApifyPlaceItem[]
    }

    throw (
      lastError ??
      new RatingLookupError('Todas las cuentas de Apify agotaron su cuota o fueron rechazadas.')
    )
  }

  // Mapea el item del actor a nuestro contrato. Lee varios nombres de campo de forma
  // defensiva porque el esquema del actor puede variar entre versiones.
  private toResult(item: ApifyPlaceItem): RatingResult | null {
    const googlePlaceId = item.placeId ?? item.fid ?? item.cid
    if (!googlePlaceId) return null
    return {
      googlePlaceId: String(googlePlaceId),
      googleRating: numeric(item.totalScore ?? item.rating),
      googleReviewCount: numeric(item.reviewsCount ?? item.reviews),
      matchedName: item.title ?? item.name ?? undefined,
      matchedAddress: item.address ?? item.street ?? undefined,
      photoUrls: extractPhotos(item).slice(0, MAX_PHOTOS),
      latitude: numeric(item.location?.lat),
      longitude: numeric(item.location?.lng),
      openingHours: extractOpeningHours(item),
      temporarilyClosed: item.temporarilyClosed === true,
      permanentlyClosed: item.permanentlyClosed === true,
    }
  }
}

// Forma parcial del item del dataset del actor. Solo lo que consumimos; todo opcional.
interface ApifyPlaceItem {
  placeId?: string
  fid?: string
  cid?: string
  title?: string
  name?: string
  address?: string
  street?: string
  totalScore?: number
  rating?: number
  reviewsCount?: number
  reviews?: number
  imageUrls?: unknown
  images?: unknown
  location?: { lat?: number; lng?: number }
  openingHours?: unknown
  temporarilyClosed?: boolean
  permanentlyClosed?: boolean
}

const DAYS: OpeningHoursDay['day'][] = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
]

// El actor devuelve `openingHours: [{ day: 'jueves', hours: '10 AM to 8:30 PM' }]` —
// día en español (pedimos language:'es') pero el tramo en formato inglés. Traducimos
// al contrato del port (24h local) para que ese detalle del vendor no se filtre.
function extractOpeningHours(item: ApifyPlaceItem): OpeningHoursDay[] | undefined {
  if (!Array.isArray(item.openingHours)) return undefined
  const out: OpeningHoursDay[] = []
  for (const raw of item.openingHours) {
    if (!raw || typeof raw !== 'object') continue
    const { day, hours } = raw as Record<string, unknown>
    if (typeof day !== 'string' || typeof hours !== 'string') continue
    const normalizedDay = DAYS.find((d) => stripAccents(d) === stripAccents(day))
    if (!normalizedDay) continue
    out.push({ day: normalizedDay, hours: normalizeHours(hours) })
  }
  return out.length > 0 ? out : undefined
}

function stripAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

// "10 AM to 8:30 PM" → "10:00–20:30" · "10 AM to 1 PM, 3 to 8 PM" → "10:00–13:00, 15:00–20:00"
// Cerrado / 24 horas se reconocen en ambos idiomas. Si no se puede parsear, se
// devuelve el texto tal cual: mejor un dato crudo visible que uno inventado.
function normalizeHours(raw: string): string {
  const text = raw.trim()
  const flat = stripAccents(text)
  if (!flat) return text
  if (flat.includes('closed') || flat.includes('cerrado')) return 'cerrado'
  if (flat.includes('24 hours') || flat.includes('24 horas')) return '24 horas'

  const ranges = text.split(',')
  const parsed: string[] = []
  for (const range of ranges) {
    // Separador "to" (en) o "a" (es), tolerante a guiones.
    const parts = range.split(/\s+(?:to|a)\s+|–|—|-/i).map((p) => p.trim())
    if (parts.length !== 2) return text
    // El meridiano puede venir solo en el extremo ("3 to 8 PM"): hereda del final.
    const end = parseTime(parts[1])
    const start = parseTime(parts[0], meridiemOf(parts[1]))
    if (!start || !end) return text
    parsed.push(`${start}–${end}`)
  }
  return parsed.join(', ')
}

function meridiemOf(s: string): 'AM' | 'PM' | undefined {
  const m = s.match(/\b(AM|PM)\b/i)
  return m ? (m[1].toUpperCase() as 'AM' | 'PM') : undefined
}

// "8:30 PM" → "20:30" · "10 AM" → "10:00" · "22:00" → "22:00"
function parseTime(s: string, inherited?: 'AM' | 'PM'): string | null {
  const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i)
  if (!m) return null
  let hour = Number(m[1])
  const minute = m[2] ?? '00'
  const meridiem = (m[3]?.toUpperCase() as 'AM' | 'PM' | undefined) ?? inherited
  if (meridiem === 'PM' && hour !== 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0
  if (hour > 24 || Number(minute) > 59) return null
  return `${String(hour).padStart(2, '0')}:${minute}`
}

function numeric(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined
}

// El actor expone las fotos como `imageUrls: string[]` o `images: [{ imageUrl }]`
// según versión. Normalizamos ambas a un array de URLs string.
function extractPhotos(item: ApifyPlaceItem): string[] {
  const out: string[] = []
  if (Array.isArray(item.imageUrls)) {
    for (const u of item.imageUrls) if (typeof u === 'string') out.push(u)
  }
  if (Array.isArray(item.images)) {
    for (const img of item.images) {
      if (typeof img === 'string') out.push(img)
      else if (img && typeof img === 'object') {
        const url = (img as Record<string, unknown>).imageUrl ?? (img as Record<string, unknown>).url
        if (typeof url === 'string') out.push(url)
      }
    }
  }
  return out
}
