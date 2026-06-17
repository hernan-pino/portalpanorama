import {
  PlaceRatingProvider,
  RatingQuery,
  RatingResult,
  RatingLookupError,
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
  private readonly token: string

  constructor(token = process.env.APIFY_TOKEN) {
    if (!token) {
      throw new RatingLookupError('Falta APIFY_TOKEN en el entorno.')
    }
    this.token = token
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
    let res: Response
    try {
      res = await fetch(`${ENDPOINT}?token=${encodeURIComponent(this.token)}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch {
      throw new RatingLookupError('No se pudo conectar con Apify (timeout o red).')
    }
    if (res.status === 401 || res.status === 403) {
      throw new RatingLookupError('Apify rechazó el token (revisá APIFY_TOKEN).')
    }
    if (!res.ok) {
      throw new RatingLookupError(`Apify respondió con error (HTTP ${res.status}).`)
    }
    const body = (await res.json()) as unknown
    if (!Array.isArray(body)) {
      throw new RatingLookupError('Respuesta inesperada de Apify (no es una lista).')
    }
    return body as ApifyPlaceItem[]
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
