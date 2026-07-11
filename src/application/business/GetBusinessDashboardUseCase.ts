import { OwnedPlaceRow, PlaceRepository } from '../ports/PlaceRepository'

export interface BusinessDashboardOutput {
  places: OwnedPlaceRow[]
}

// Panel de negocio: las fichas que el usuario gestiona (propias + de sus marcas),
// con su engagement. Vacío = el usuario aún no tiene ningún negocio aprobado.
export class GetBusinessDashboardUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(userId: string): Promise<BusinessDashboardOutput> {
    const places = await this.placeRepo.findManagedByUser(userId)
    return { places }
  }
}
