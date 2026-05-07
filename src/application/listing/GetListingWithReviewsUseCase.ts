import { Listing } from '@domain/listing/Listing'
import { Review } from '@domain/review/Review'
import { AnalyticsService } from '../ports/AnalyticsService'
import { ListingRepository } from '../ports/ListingRepository'
import { ReviewRepository, ReviewStats } from '../ports/ReviewRepository'

export interface GetListingWithReviewsInput {
  slug: string
  trackView?: boolean
}

export interface GetListingWithReviewsOutput {
  listing: Listing
  reviews: Review[]
  stats: ReviewStats
}

export class GetListingWithReviewsUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async execute(input: GetListingWithReviewsInput): Promise<GetListingWithReviewsOutput | null> {
    const listing = await this.listingRepo.findBySlug(input.slug)
    if (!listing) return null

    if (input.trackView) {
      this.analyticsService.trackView(listing.id).catch(() => undefined)
    }

    const [reviews, stats] = await Promise.all([
      this.reviewRepo.findByListingId(listing.id),
      this.reviewRepo.getStats(listing.id),
    ])

    return { listing, reviews, stats }
  }
}
