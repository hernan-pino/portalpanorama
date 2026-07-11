import { DomainError } from '@domain/shared/DomainError'

export class ClaimNotFoundError extends DomainError {
  readonly code = 'CLAIM_NOT_FOUND'
  constructor(claimId: string) {
    super(`No existe el reclamo "${claimId}"`)
  }
}
