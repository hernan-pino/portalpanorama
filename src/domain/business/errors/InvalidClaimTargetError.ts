import { DomainError } from '@domain/shared/DomainError'

// Un reclamo apunta a un Place O a una Brand — exactamente uno (BUSINESS_ACCOUNTS_SPEC §3).
export class InvalidClaimTargetError extends DomainError {
  readonly code = 'INVALID_CLAIM_TARGET'
  constructor() {
    super('Un reclamo debe apuntar a exactamente un lugar o una marca')
  }
}
