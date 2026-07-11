import { DomainError } from '@domain/shared/DomainError'

// El mismo usuario ya tiene un reclamo pendiente sobre el mismo objetivo.
export class DuplicateClaimError extends DomainError {
  readonly code = 'DUPLICATE_CLAIM'
  constructor() {
    super('Ya existe un reclamo pendiente de este usuario sobre este objetivo')
  }
}
