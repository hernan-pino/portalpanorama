import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceRepository } from '../ports/PlaceRepository'

// Borrado duro de una ficha (irreversible). A diferencia de archive() —que la
// oculta preservando el historial— esto la elimina del todo. Para descartes
// reales del admin (fichas erróneas, duplicados, lugares que no existen).
export class DeletePlaceUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(placeId: string): Promise<void> {
    const place = await this.placeRepo.findById(placeId)
    if (!place) throw new PlaceNotFoundError(placeId)
    await this.placeRepo.delete(placeId)
  }
}
