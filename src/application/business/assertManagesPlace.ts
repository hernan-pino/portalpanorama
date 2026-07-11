import { OwnerEditablePlaceView } from '../ports/PlaceRepository'
import { UnauthorizedBusinessAccessError } from '@domain/business/errors/UnauthorizedBusinessAccessError'

// Guard de autorización del panel de negocio (anti-IDOR): un usuario gestiona una
// ficha si es su dueño directo (ownerId) o dueño de la marca que la agrupa
// (brandOwnerId). Lanza si no. La verificación vive en application, no en el repo.
export function assertManagesPlace(userId: string, place: OwnerEditablePlaceView): void {
  const manages = place.ownerId === userId || place.brandOwnerId === userId
  if (!manages) throw new UnauthorizedBusinessAccessError(userId, place.slug)
}
