import { DomainError } from '@domain/shared/DomainError'

export class CuratedListNotFoundError extends DomainError {
  readonly code = 'CURATED_LIST_NOT_FOUND'
  constructor(idOrSlug: string) {
    super(`No existe la lista curada "${idOrSlug}".`)
  }
}
