import { DomainError } from '@domain/shared/DomainError'

export class CuratedListEmptyRuleError extends DomainError {
  readonly code = 'CURATED_LIST_EMPTY_RULE'
  constructor() {
    super('La regla de la lista no puede estar vacía: seleccionaría todo el catálogo.')
  }
}
