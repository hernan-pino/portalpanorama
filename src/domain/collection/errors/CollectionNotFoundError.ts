import { DomainError } from '@domain/shared/DomainError'

export class CollectionNotFoundError extends DomainError {
  readonly code = 'COLLECTION_NOT_FOUND'
  constructor(identifier: string) {
    super(`No existe una colección con identificador "${identifier}"`)
  }
}
