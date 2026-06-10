import { DomainError } from '@domain/shared/DomainError'
import { PlaceStatus } from '../PlaceStatus'

export class InvalidPlaceTransitionError extends DomainError {
  readonly code = 'INVALID_PLACE_TRANSITION'
  constructor(from: PlaceStatus, to: PlaceStatus) {
    super(`Transición de estado inválida: ${from} → ${to}`)
  }
}
