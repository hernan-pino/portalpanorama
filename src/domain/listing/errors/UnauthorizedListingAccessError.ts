import { DomainError } from '@domain/shared/DomainError'

export class UnauthorizedListingAccessError extends DomainError {
  readonly code = 'UNAUTHORIZED_LISTING_ACCESS'
  constructor(userId: string, listingId: string) {
    super(`Usuario "${userId}" no tiene acceso al listing "${listingId}"`)
  }
}
