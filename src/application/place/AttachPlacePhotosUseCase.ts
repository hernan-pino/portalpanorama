import { createId } from '@paralleldrive/cuid2'
import { PlaceImage } from '@domain/place/Place'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceRepository } from '../ports/PlaceRepository'

// Rehospeda una imagen externa (descarga con guardas SSRF + comprime + sube al
// storage propio) y devuelve la URL final. Lo cumple ImportImageFromUrlUseCase; se
// inyecta como interfaz para poder mockearlo en tests.
export interface ImageImporter {
  execute(input: { url: string }): Promise<{ url: string }>
}

export interface AttachPlacePhotosInput {
  placeId: string
  // URLs de fotos del lugar (las que trae el PlaceRatingProvider desde Google Maps).
  photoUrls: string[]
  // Cuántas adjuntar como máximo (las primeras). Default 5.
  max?: number
  // Solo adjuntar si la ficha NO tiene imágenes (no pisar las curadas a mano). Default true.
  onlyIfEmpty?: boolean
}

export type AttachPlacePhotosResult =
  | { status: 'attached'; count: number }
  | { status: 'skipped'; reason: 'has-images' | 'no-photos' | 'none-rehosted' }

// Adjunta a un Place fotos externas (Google Maps vía Apify), rehospedándolas en el
// storage propio (nunca hotlink). Por defecto solo actúa sobre fichas sin imágenes,
// para no tocar las curadas a mano. No cambia el estado de la ficha. El crédito queda
// como "Google Maps" para dejar rastro de la fuente (copyright/ToS = del usuario).
export class AttachPlacePhotosUseCase {
  constructor(
    private readonly placeRepo: PlaceRepository,
    private readonly imageImporter: ImageImporter,
  ) {}

  async execute(input: AttachPlacePhotosInput): Promise<AttachPlacePhotosResult> {
    const place = await this.placeRepo.findById(input.placeId)
    if (!place) throw new PlaceNotFoundError(input.placeId)

    const onlyIfEmpty = input.onlyIfEmpty ?? true
    if (onlyIfEmpty && place.images.length > 0) {
      return { status: 'skipped', reason: 'has-images' }
    }
    if (input.photoUrls.length === 0) {
      return { status: 'skipped', reason: 'no-photos' }
    }

    const urls = input.photoUrls.slice(0, input.max ?? 5)
    const rehosted: string[] = []
    for (const url of urls) {
      try {
        const { url: hosted } = await this.imageImporter.execute({ url })
        rehosted.push(hosted)
      } catch {
        // Una foto que no se pudo traer (expiró, bloqueada) no aborta el resto.
      }
    }
    if (rehosted.length === 0) {
      return { status: 'skipped', reason: 'none-rehosted' }
    }

    const baseOrder = place.images.length
    const newImages: PlaceImage[] = rehosted.map((url, i) => ({
      id: createId(),
      url,
      alt: place.name,
      credit: 'Google Maps',
      isPrimary: false,
      sortOrder: baseOrder + i,
    }))

    await this.placeRepo.save(place.withImages([...place.images, ...newImages]))
    return { status: 'attached', count: newImages.length }
  }
}
