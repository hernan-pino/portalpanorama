import { Listing } from '@domain/listing/Listing'
import { Subscription } from '@domain/subscription/Subscription'
import { ListingRepository } from '../ports/ListingRepository'
import { SubscriptionRepository } from '../ports/SubscriptionRepository'

export interface ListingSubscriptionView {
  listing: Listing
  subscription: Subscription | null
}

export class GetListingSubscriptionsUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly subscriptionRepo: SubscriptionRepository,
  ) {}

  async execute(userId: string): Promise<ListingSubscriptionView[]> {
    const listings = await this.listingRepo.findByOwnerId(userId)

    return Promise.all(
      listings.map(async (listing) => ({
        listing,
        subscription: await this.subscriptionRepo.findByListingId(listing.id),
      })),
    )
  }
}
