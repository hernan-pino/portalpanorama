import { DomainError } from '@domain/shared/DomainError'

export class ListingNotFoundError extends DomainError {
  readonly code = 'LISTING_NOT_FOUND'
  constructor(idOrSlug: string) {
    super(`Listing no encontrado: "${idOrSlug}"`)
  }
}
