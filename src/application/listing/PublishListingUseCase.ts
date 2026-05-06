import { Listing } from '@domain/listing/Listing'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { ListingRepository } from '../ports/ListingRepository'
import { SearchService } from '../ports/SearchService'

export interface PublishListingInput {
  listingId: string
  userId: string
}

export interface PublishListingOutput {
  listing: Listing
}

export class PublishListingUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly searchService: SearchService,
  ) {}

  async execute(input: PublishListingInput): Promise<PublishListingOutput> {
    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    listing.assertOwnership(input.userId)

    const published = listing.publish()
    await this.listingRepo.save(published)
    await this.searchService.indexListing(published)

    return { listing: published }
  }
}
