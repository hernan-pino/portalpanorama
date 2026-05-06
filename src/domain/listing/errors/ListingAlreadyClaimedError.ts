import { DomainError } from '@domain/shared/DomainError'

export class ListingAlreadyClaimedError extends DomainError {
  readonly code = 'LISTING_ALREADY_CLAIMED'
  constructor(listingId: string) {
    super(`El listing "${listingId}" ya tiene un claim PENDING activo`)
  }
}
