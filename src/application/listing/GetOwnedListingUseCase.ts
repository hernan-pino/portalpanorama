import { Listing } from '@domain/listing/Listing'
import { ListingRepository } from '../ports/ListingRepository'

export interface GetOwnedListingInput {
  listingId: string
  userId: string
}

export class GetOwnedListingUseCase {
  constructor(private readonly listingRepo: ListingRepository) {}

  async execute(input: GetOwnedListingInput): Promise<Listing | null> {
    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing || listing.ownerId !== input.userId) return null
    return listing
  }
}
