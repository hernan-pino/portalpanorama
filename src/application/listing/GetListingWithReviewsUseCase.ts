import { Listing } from '@domain/listing/Listing'
import { Review } from '@domain/review/Review'
import { AnalyticsService } from '../ports/AnalyticsService'
import { ListingRepository } from '../ports/ListingRepository'
import { ReviewRepository, ReviewStats } from '../ports/ReviewRepository'
import { UserRepository } from '../ports/UserRepository'

export interface GetListingWithReviewsInput {
  slug: string
  userId?: string
  trackView?: boolean
}

export interface GetListingWithReviewsOutput {
  listing: Listing
  reviews: Review[]
  stats: ReviewStats
  isFavorite: boolean
  userReview: Review | null
  ownerName: string | null
}

export class GetListingWithReviewsUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly reviewRepo: ReviewRepository,
    private readonly analyticsService: AnalyticsService,
    private readonly userRepo: UserRepository,
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

    let isFavorite = false
    let userReview: Review | null = null

    if (input.userId) {
      ;[isFavorite, userReview] = await Promise.all([
        this.userRepo.isFavorite(input.userId, listing.id),
        this.reviewRepo.findByUserAndListing(input.userId, listing.id),
      ])
    }

    const owner = await this.userRepo.findById(listing.ownerId)
    const ownerName = owner?.isBusinessOwner() ? owner.name : null

    return { listing, reviews, stats, isFavorite, userReview, ownerName }
  }
}
