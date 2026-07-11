import { DomainError } from '@domain/shared/DomainError'
import { ClaimStatus } from '../ClaimStatus'

// Solo un reclamo PENDING se puede aprobar o rechazar; la decisión es única.
export class InvalidClaimTransitionError extends DomainError {
  readonly code = 'INVALID_CLAIM_TRANSITION'
  constructor(from: ClaimStatus) {
    super(`Un reclamo en estado ${from} ya fue revisado y no admite otra decisión`)
  }
}
