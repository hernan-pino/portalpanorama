import { DomainError } from '@domain/shared/DomainError'

export class PlaceNotFoundError extends DomainError {
  readonly code = 'PLACE_NOT_FOUND'
  constructor(identifier: string) {
    super(`No existe un lugar con identificador "${identifier}"`)
  }
}
