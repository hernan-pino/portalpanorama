import { Review } from '@domain/review/Review'
import { DomainError } from '@domain/shared/DomainError'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { ReviewRepository } from '../ports/ReviewRepository'
import { ListingRepository } from '../ports/ListingRepository'

export class ReviewNotFoundError extends DomainError {
  readonly code = 'REVIEW_NOT_FOUND'
  constructor(reviewId: string) {
    super(`Review "${reviewId}" no encontrada`)
  }
}

export interface RespondToReviewInput {
  reviewId: string
  ownerId: string
  response: string
}

export interface RespondToReviewOutput {
  review: Review
}

export class RespondToReviewUseCase {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly listingRepo: ListingRepository,
  ) {}

  async execute(input: RespondToReviewInput): Promise<RespondToReviewOutput> {
    const review = await this.reviewRepo.findById(input.reviewId)
    if (!review) throw new ReviewNotFoundError(input.reviewId)

    const listing = await this.listingRepo.findById(review.listingId)
    if (!listing) throw new ListingNotFoundError(review.listingId)

    listing.assertOwnership(input.ownerId)

    const withResponse = review.respond(input.response)
    await this.reviewRepo.save(withResponse)

    return { review: withResponse }
  }
}
