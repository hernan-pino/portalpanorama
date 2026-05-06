import { Listing } from '@domain/listing/Listing'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { ListingRepository } from '../ports/ListingRepository'
import { SearchService } from '../ports/SearchService'

export interface UpgradeListingToPremiumInput {
  listingId: string
  userId: string
}

export interface UpgradeListingToPremiumOutput {
  listing: Listing
}

export class UpgradeListingToPremiumUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly searchService: SearchService,
  ) {}

  async execute(input: UpgradeListingToPremiumInput): Promise<UpgradeListingToPremiumOutput> {
    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    listing.assertOwnership(input.userId)

    const upgraded = listing.upgradeToPremium()
    await this.listingRepo.save(upgraded)

    if (upgraded.isPublished()) {
      await this.searchService.indexListing(upgraded)
    }

    return { listing: upgraded }
  }
}
