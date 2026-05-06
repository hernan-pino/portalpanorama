import { createId } from '@paralleldrive/cuid2'
import { FeedItem } from '@domain/feed/FeedItem'
import { FeedItemType } from '@domain/feed/FeedItemType'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { Review } from '@domain/review/Review'
import { DuplicateReviewError } from '@domain/review/errors/DuplicateReviewError'
import { FeedRepository } from '../ports/FeedRepository'
import { ListingRepository } from '../ports/ListingRepository'
import { ReviewRepository } from '../ports/ReviewRepository'
import { UserRepository } from '../ports/UserRepository'

export interface CreateReviewInput {
  listingId: string
  userId: string
  rating: number
  body: string
}

export interface CreateReviewOutput {
  review: Review
}

export class CreateReviewUseCase {
  constructor(
    private readonly reviewRepo: ReviewRepository,
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
    private readonly feedRepo: FeedRepository,
  ) {}

  async execute(input: CreateReviewInput): Promise<CreateReviewOutput> {
    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    const existing = await this.reviewRepo.findByUserAndListing(input.userId, input.listingId)
    if (existing) throw new DuplicateReviewError(input.userId, input.listingId)

    const review = Review.create({
      id: createId(),
      listingId: input.listingId,
      userId: input.userId,
      rating: input.rating,
      body: input.body,
      createdAt: new Date(),
    })

    await this.reviewRepo.save(review)
    await this.notifyFollowers(input.listingId)

    return { review }
  }

  private async notifyFollowers(listingId: string): Promise<void> {
    const followerIds = await this.userRepo.findUserIdsWithFavorite(listingId)
    await Promise.all(
      followerIds.map((userId) =>
        this.feedRepo.createItem(
          FeedItem.create({
            id: createId(),
            userId,
            listingId,
            type: FeedItemType.NEW_REVIEW,
            read: false,
            createdAt: new Date(),
          }),
        ),
      ),
    )
  }
}
