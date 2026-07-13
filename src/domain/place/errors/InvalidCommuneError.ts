import { DomainError } from '@domain/shared/DomainError'

// La comuna no está en el catálogo. Solo puede pasar con un payload manipulado: el
// form la elige de un selector.
export class InvalidCommuneError extends DomainError {
  readonly code = 'INVALID_COMMUNE'
  constructor(communeId: string) {
    super(`No existe una comuna con id "${communeId}"`)
  }
}
