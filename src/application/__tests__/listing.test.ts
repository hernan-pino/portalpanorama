import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ListingStatus } from '@domain/listing/ListingStatus'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { ListingAlreadyClaimedError } from '@domain/listing/errors/ListingAlreadyClaimedError'
import { UnauthorizedListingAccessError } from '@domain/listing/errors/UnauthorizedListingAccessError'
import { ClaimListingUseCase, ListingNotPublishedError } from '../listing/ClaimListingUseCase'
import { CreateListingUseCase } from '../listing/CreateListingUseCase'
import { PublishListingUseCase } from '../listing/PublishListingUseCase'
import { ListingRepository } from '../ports/ListingRepository'
import { SearchService } from '../ports/SearchService'
import { UserRepository } from '../ports/UserRepository'
import { EmailService } from '../ports/EmailService'
import { makeListing, makePublishedListing, makeUser } from './fixtures'

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

function mockSearchService(partial: Partial<SearchService> = {}): SearchService {
  return {
    search: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, totalPages: 0 }),
    indexListing: vi.fn().mockResolvedValue(undefined),
    removeListing: vi.fn().mockResolvedValue(undefined),
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

function mockEmailService(partial: Partial<EmailService> = {}): EmailService {
  return {
    sendWelcome: vi.fn().mockResolvedValue(undefined),
    sendClaimReceived: vi.fn().mockResolvedValue(undefined),
    sendClaimApproved: vi.fn().mockResolvedValue(undefined),
    sendClaimRejected: vi.fn().mockResolvedValue(undefined),
    sendPaymentFailed: vi.fn().mockResolvedValue(undefined),
    sendSubscriptionCancelled: vi.fn().mockResolvedValue(undefined),
    ...partial,
  }
}

// --- CreateListingUseCase ---

describe('CreateListingUseCase', () => {
  it('crea un listing en estado DRAFT con slug generado desde el nombre', async () => {
    const repo = mockListingRepo()
    const useCase = new CreateListingUseCase(repo)

    const { listing } = await useCase.execute({
      name: 'Café Lastarria',
      categoryId: 'cat-1',
      neighborhood: 'Lastarria',
      ownerId: 'user-1',
    })

    expect(listing.status).toBe(ListingStatus.DRAFT)
    expect(listing.slug.value).toBe('cafe-lastarria')
    expect(listing.name).toBe('Café Lastarria')
    expect(listing.ownerId).toBe('user-1')
    expect(repo.save).toHaveBeenCalledWith(listing)
  })

  it('agrega sufijo numérico si el slug ya existe', async () => {
    const existingListing = makeListing({ id: 'other' })
    const repo = mockListingRepo({
      findBySlug: vi
        .fn()
        .mockResolvedValueOnce(existingListing) // 'cafe-lastarria' tomado
        .mockResolvedValueOnce(null),           // 'cafe-lastarria-1' libre
    })
    const useCase = new CreateListingUseCase(repo)

    const { listing } = await useCase.execute({
      name: 'Café Lastarria',
      categoryId: 'cat-1',
      neighborhood: 'Lastarria',
      ownerId: 'user-1',
    })

    expect(listing.slug.value).toBe('cafe-lastarria-1')
  })
})

// --- PublishListingUseCase ---

describe('PublishListingUseCase', () => {
  it('publica un listing DRAFT y lo indexa en búsqueda', async () => {
    const draft = makeListing({ status: ListingStatus.DRAFT, ownerId: 'user-1' })
    const repo = mockListingRepo({ findById: vi.fn().mockResolvedValue(draft) })
    const search = mockSearchService()
    const useCase = new PublishListingUseCase(repo, search)

    const { listing } = await useCase.execute({ listingId: 'listing-1', userId: 'user-1' })

    expect(listing.status).toBe(ListingStatus.PUBLISHED)
    expect(repo.save).toHaveBeenCalledWith(listing)
    expect(search.indexListing).toHaveBeenCalledWith(listing)
  })

  it('lanza error si el listing no existe', async () => {
    const useCase = new PublishListingUseCase(mockListingRepo(), mockSearchService())

    await expect(
      useCase.execute({ listingId: 'no-existe', userId: 'user-1' }),
    ).rejects.toBeInstanceOf(ListingNotFoundError)
  })

  it('lanza error si el usuario no es el dueño', async () => {
    const draft = makeListing({ ownerId: 'otro-usuario' })
    const repo = mockListingRepo({ findById: vi.fn().mockResolvedValue(draft) })
    const useCase = new PublishListingUseCase(repo, mockSearchService())

    await expect(
      useCase.execute({ listingId: 'listing-1', userId: 'user-1' }),
    ).rejects.toBeInstanceOf(UnauthorizedListingAccessError)
  })
})

// --- ClaimListingUseCase ---

describe('ClaimListingUseCase', () => {
  it('crea un claim PENDING para un listing publicado', async () => {
    const listing = makePublishedListing({ ownerId: 'original-owner' })
    const claimant = makeUser({ id: 'user-2' })
    const repo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const userRepo = mockUserRepo({ findById: vi.fn().mockResolvedValue(claimant) })
    const email = mockEmailService()
    const useCase = new ClaimListingUseCase(repo, userRepo, email)

    const { claim } = await useCase.execute({
      listingId: 'listing-1',
      claimantId: 'user-2',
      message: 'Soy el dueño real',
    })

    expect(claim.listingId).toBe('listing-1')
    expect(claim.claimantId).toBe('user-2')
    expect(claim.isPending()).toBe(true)
    expect(repo.saveClaim).toHaveBeenCalledWith(claim)
    expect(email.sendClaimReceived).toHaveBeenCalled()
  })

  it('lanza error si el listing no está publicado', async () => {
    const draft = makeListing({ status: ListingStatus.DRAFT })
    const repo = mockListingRepo({ findById: vi.fn().mockResolvedValue(draft) })
    const claimant = makeUser({ id: 'user-2' })
    const userRepo = mockUserRepo({ findById: vi.fn().mockResolvedValue(claimant) })
    const useCase = new ClaimListingUseCase(repo, userRepo, mockEmailService())

    await expect(
      useCase.execute({ listingId: 'listing-1', claimantId: 'user-2' }),
    ).rejects.toBeInstanceOf(ListingNotPublishedError)
  })

  it('lanza error si ya hay un claim PENDING para el listing', async () => {
    const listing = makePublishedListing()
    const existingClaim = listing // just a truthy value for the mock
    const repo = mockListingRepo({
      findById: vi.fn().mockResolvedValue(listing),
      findPendingClaimByListingId: vi.fn().mockResolvedValue(existingClaim),
    })
    const userRepo = mockUserRepo({ findById: vi.fn().mockResolvedValue(makeUser({ id: 'user-2' })) })
    const useCase = new ClaimListingUseCase(repo, userRepo, mockEmailService())

    await expect(
      useCase.execute({ listingId: 'listing-1', claimantId: 'user-2' }),
    ).rejects.toBeInstanceOf(ListingAlreadyClaimedError)
  })
})
