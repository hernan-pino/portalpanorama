import { PlaceAdminRow, PlaceRepository } from '../ports/PlaceRepository'

// Tabla del panel de admin: todos los lugares en cualquier estado (a diferencia
// de la búsqueda pública, que solo ve PUBLISHED). El repo ordena por updatedAt desc.
export class ListPlacesForAdminUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  execute(): Promise<PlaceAdminRow[]> {
    return this.placeRepo.listForAdmin()
  }
}
