import { DomainError } from '@domain/shared/DomainError'

export class CuratedListNameRequiredError extends DomainError {
  readonly code = 'CURATED_LIST_NAME_REQUIRED'
  constructor() {
    super('La lista curada necesita un nombre.')
  }
}
