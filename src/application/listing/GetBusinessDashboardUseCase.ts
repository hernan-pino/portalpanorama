import { Listing } from '@domain/listing/Listing'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { ListingStats } from '../ports/AnalyticsService'
import { AnalyticsService } from '../ports/AnalyticsService'
import { ListingRepository } from '../ports/ListingRepository'
import { ReviewRepository } from '../ports/ReviewRepository'
import { ReviewStats } from '../ports/ReviewRepository'
import { UserRepository } from '../ports/UserRepository'

export interface BusinessDashboardListing {
  listing: Listing
  reviewStats: ReviewStats
  analyticsStats: ListingStats
}

export interface GetBusinessDashboardOutput {
  listings: BusinessDashboardListing[]
}

export class GetBusinessDashboardUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly listingRepo: ListingRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async execute(userId: string): Promise<GetBusinessDashboardOutput> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new UserNotFoundError(userId)

    const listings = await this.listingRepo.findByOwnerId(userId)

    const listingsWithStats = await Promise.all(
      listings.map(async (listing) => {
        const [reviewStats, analyticsStats] = await Promise.all([
          this.reviewRepo.getStats(listing.id),
          this.analyticsService.getStats(listing.id),
        ])
        return { listing, reviewStats, analyticsStats }
      }),
    )

    return { listings: listingsWithStats }
  }
}
