import { describe, it, expect, vi } from 'vitest'
import { DuplicateReviewError } from '@domain/review/errors/DuplicateReviewError'
import { ReviewAlreadyRespondedError } from '@domain/review/Review'
import { UnauthorizedListingAccessError } from '@domain/listing/errors/UnauthorizedListingAccessError'
import { CreateReviewUseCase } from '../review/CreateReviewUseCase'
import { RespondToReviewUseCase } from '../review/RespondToReviewUseCase'
import { ReviewRepository } from '../ports/ReviewRepository'
import { ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'
import { FeedRepository } from '../ports/FeedRepository'
import { makeListing, makeReview } from './fixtures'

function mockReviewRepo(partial: Partial<ReviewRepository> = {}): ReviewRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByListingId: vi.fn().mockResolvedValue([]),
    findByUserAndListing: vi.fn().mockResolvedValue(null),
    getStats: vi.fn().mockResolvedValue({ count: 0, averageRating: 0 }),
    save: vi.fn().mockResolvedValue(undefined),
    ...partial,
  }
}

function mockListingRepo(partial: Partial<ListingRepository> = {}): ListingRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findBySlug: vi.fn().mockResolvedValue(null),
    findByOwnerId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    findClaimById: vi.fn().mockResolvedValue(null),
    findPendingClaimByListingId: vi.fn().mockResolvedValue(null),
    saveClaim: vi.fn().mockResolvedValue(undefined),
    findPendingClaims: vi.fn().mockResolvedValue([]),
    findPendingTags: vi.fn().mockResolvedValue([]),
    ...partial,
  }
}

function mockUserRepo(partial: Partial<UserRepository> = {}): UserRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByEmail: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue(undefined),
    save: vi.fn().mockResolvedValue(undefined),
    addFavorite: vi.fn().mockResolvedValue(undefined),
    removeFavorite: vi.fn().mockResolvedValue(undefined),
    isFavorite: vi.fn().mockResolvedValue(false),
    findFavoriteListings: vi.fn().mockResolvedValue([]),
    findUserIdsWithFavorite: vi.fn().mockResolvedValue([]),
    ...partial,
  }
}

function mockFeedRepo(partial: Partial<FeedRepository> = {}): FeedRepository {
  return {
    createItem: vi.fn().mockResolvedValue(undefined),
    findByUserId: vi.fn().mockResolvedValue([]),
    markAsRead: vi.fn().mockResolvedValue(undefined),
    ...partial,
  }
}

// --- CreateReviewUseCase ---

describe('CreateReviewUseCase', () => {
  it('crea una review y notifica a seguidores del listing', async () => {
    const listing = makeListing()
    const reviewRepo = mockReviewRepo()
    const listingRepo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const userRepo = mockUserRepo({
      findUserIdsWithFavorite: vi.fn().mockResolvedValue(['follower-1', 'follower-2']),
    })
    const feedRepo = mockFeedRepo()
    const useCase = new CreateReviewUseCase(reviewRepo, listingRepo, userRepo, feedRepo)

    const { review } = await useCase.execute({
      listingId: 'listing-1',
      userId: 'user-2',
      rating: 9,
      body: 'Excelente lugar',
    })

    expect(review.rating).toBe(9)
    expect(review.body).toBe('Excelente lugar')
    expect(reviewRepo.save).toHaveBeenCalledWith(review)
    expect(feedRepo.createItem).toHaveBeenCalledTimes(2)
  })

  it('lanza DuplicateReviewError si el usuario ya reseñó este listing', async () => {
    const listing = makeListing()
    const existingReview = makeReview({ userId: 'user-2' })
    const reviewRepo = mockReviewRepo({
      findByUserAndListing: vi.fn().mockResolvedValue(existingReview),
    })
    const listingRepo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const useCase = new CreateReviewUseCase(reviewRepo, listingRepo, mockUserRepo(), mockFeedRepo())

    await expect(
      useCase.execute({ listingId: 'listing-1', userId: 'user-2', rating: 7, body: 'Repitiendo' }),
    ).rejects.toBeInstanceOf(DuplicateReviewError)
  })
})

// --- RespondToReviewUseCase ---

describe('RespondToReviewUseCase', () => {
  it('el dueño puede responder una review sin respuesta previa', async () => {
    const listing = makeListing({ ownerId: 'owner-1' })
    const review = makeReview({ listingId: 'listing-1' })
    const reviewRepo = mockReviewRepo({ findById: vi.fn().mockResolvedValue(review) })
    const listingRepo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const useCase = new RespondToReviewUseCase(reviewRepo, listingRepo)

    const { review: responded } = await useCase.execute({
      reviewId: 'review-1',
      ownerId: 'owner-1',
      response: 'Gracias por tu visita!',
    })

    expect(responded.response).toBe('Gracias por tu visita!')
    expect(reviewRepo.save).toHaveBeenCalledWith(responded)
  })

  it('lanza error si alguien que no es dueño intenta responder', async () => {
    const listing = makeListing({ ownerId: 'owner-1' })
    const review = makeReview()
    const reviewRepo = mockReviewRepo({ findById: vi.fn().mockResolvedValue(review) })
    const listingRepo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const useCase = new RespondToReviewUseCase(reviewRepo, listingRepo)

    await expect(
      useCase.execute({ reviewId: 'review-1', ownerId: 'otro-usuario', response: 'Hola' }),
    ).rejects.toBeInstanceOf(UnauthorizedListingAccessError)
  })

  it('lanza error si la review ya tiene respuesta', async () => {
    const listing = makeListing({ ownerId: 'owner-1' })
    const reviewWithResponse = makeReview({ response: 'Ya respondí' })
    const reviewRepo = mockReviewRepo({ findById: vi.fn().mockResolvedValue(reviewWithResponse) })
    const listingRepo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const useCase = new RespondToReviewUseCase(reviewRepo, listingRepo)

    await expect(
      useCase.execute({ reviewId: 'review-1', ownerId: 'owner-1', response: 'Otra respuesta' }),
    ).rejects.toBeInstanceOf(ReviewAlreadyRespondedError)
  })
})
