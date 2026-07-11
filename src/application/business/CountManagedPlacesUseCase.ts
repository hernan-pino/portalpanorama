import { PlaceRepository } from '../ports/PlaceRepository'

// ¿Cuántas fichas gestiona el usuario? Decide si mostrar el acceso al panel de
// negocio en el header. Envuelto en use case por consistencia del composition root
// (y por si el conteo suma reglas — ej. excluir archivadas — más adelante).
export class CountManagedPlacesUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  execute(userId: string): Promise<number> {
    return this.placeRepo.countManagedByUser(userId)
  }
}
