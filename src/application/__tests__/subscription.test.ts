import { describe, it, expect, vi } from 'vitest'
import { Money } from '@domain/shared/Money'
import { ListingPlan } from '@domain/listing/ListingPlan'
import { SubscriptionStatus } from '@domain/subscription/SubscriptionStatus'
import { SubscriptionNotActiveError } from '@domain/subscription/errors/SubscriptionNotActiveError'
import { HandlePaymentWebhookUseCase } from '../subscription/HandlePaymentWebhookUseCase'
import { CancelSubscriptionUseCase } from '../subscription/CancelSubscriptionUseCase'
import { ListingRepository } from '../ports/ListingRepository'
import { SubscriptionRepository } from '../ports/SubscriptionRepository'
import { PaymentGateway } from '../ports/PaymentGateway'
import { UserRepository } from '../ports/UserRepository'
import { EmailService } from '../ports/EmailService'
import { StorageService } from '../ports/StorageService'
import { makeListing, makeSubscription } from './fixtures'

function mockListingRepo(partial: Partial<ListingRepository> = {}): ListingRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findBySlug: vi.fn().mockResolvedValue(null),
    findByOwnerId: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    findClaimById: vi.fn().mockResolvedValue(null),
    findPendingClaimByListingId: vi.fn().mockResolvedValue(null),
    saveClaim: vi.fn().mockResolvedValue(undefined),
    ...partial,
  }
}

function mockSubRepo(partial: Partial<SubscriptionRepository> = {}): SubscriptionRepository {
  return {
    findByListingId: vi.fn().mockResolvedValue(null),
    findByFlowSubId: vi.fn().mockResolvedValue(null),
    save: vi.fn().mockResolvedValue(undefined),
    ...partial,
  }
}

function mockPaymentGateway(partial: Partial<PaymentGateway> = {}): PaymentGateway {
  return {
    createSubscription: vi.fn().mockResolvedValue({ paymentUrl: 'https://flow.cl/pay/123' }),
    cancelSubscription: vi.fn().mockResolvedValue(undefined),
    parseWebhookEvent: vi.fn(),
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

function mockEmailService(): EmailService {
  return {
    sendWelcome: vi.fn().mockResolvedValue(undefined),
    sendClaimReceived: vi.fn().mockResolvedValue(undefined),
    sendClaimApproved: vi.fn().mockResolvedValue(undefined),
    sendClaimRejected: vi.fn().mockResolvedValue(undefined),
    sendPaymentFailed: vi.fn().mockResolvedValue(undefined),
    sendSubscriptionCancelled: vi.fn().mockResolvedValue(undefined),
  }
}

function mockStorageService(): StorageService {
  return {
    upload: vi.fn().mockResolvedValue('https://storage.example.com/file.jpg'),
    delete: vi.fn().mockResolvedValue(undefined),
  }
}

// --- HandlePaymentWebhookUseCase ---

describe('HandlePaymentWebhookUseCase', () => {
  it('activa suscripción y upgradea listing a PREMIUM cuando el pago se confirma', async () => {
    const listing = makeListing({ status: undefined as any })
    const listingRepo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const subRepo = mockSubRepo()
    const gateway = mockPaymentGateway({
      parseWebhookEvent: vi.fn().mockResolvedValue({
        type: 'subscription.activated',
        flowSubId: 'sub-flow-123',
        flowPlanId: 'plan-123',
        listingId: 'listing-1',
        pricePerMonth: Money.create(9990),
        currentPeriodEnd: new Date('2026-06-01'),
      }),
    })
    const useCase = new HandlePaymentWebhookUseCase(
      gateway,
      subRepo,
      listingRepo,
      mockUserRepo(),
      mockEmailService(),
    )

    await useCase.execute({ rawBody: '{}' }, 'signature', '1716000000')

    expect(subRepo.save).toHaveBeenCalled()
    const savedSub = (subRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(savedSub.status).toBe(SubscriptionStatus.ACTIVE)
    expect(savedSub.flowSubId).toBe('sub-flow-123')

    expect(listingRepo.save).toHaveBeenCalled()
    const savedListing = (listingRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(savedListing.plan).toBe(ListingPlan.PREMIUM)
  })

  it('marca la suscripción como PAST_DUE y notifica al dueño si el pago falla', async () => {
    const sub = makeSubscription({ flowSubId: 'sub-flow-123' })
    const listing = makeListing()
    const subRepo = mockSubRepo({ findByFlowSubId: vi.fn().mockResolvedValue(sub) })
    const listingRepo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const email = mockEmailService()
    const gateway = mockPaymentGateway({
      parseWebhookEvent: vi.fn().mockResolvedValue({
        type: 'payment.failed',
        flowSubId: 'sub-flow-123',
        flowPlanId: 'plan-123',
        listingId: 'listing-1',
        pricePerMonth: Money.create(9990),
      }),
    })
    const useCase = new HandlePaymentWebhookUseCase(
      gateway,
      subRepo,
      listingRepo,
      mockUserRepo(),
      email,
    )

    await useCase.execute({ rawBody: '{}' }, 'signature', '1716000000')

    const savedSub = (subRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(savedSub.status).toBe(SubscriptionStatus.PAST_DUE)
  })
})

// --- CancelSubscriptionUseCase ---

describe('CancelSubscriptionUseCase', () => {
  it('cancela la suscripción y baja el listing a FREE', async () => {
    const listing = makeListing()
    const sub = makeSubscription()
    const listingRepo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const subRepo = mockSubRepo({ findByListingId: vi.fn().mockResolvedValue(sub) })
    const gateway = mockPaymentGateway()
    const useCase = new CancelSubscriptionUseCase(
      listingRepo,
      subRepo,
      gateway,
      mockStorageService(),
      mockEmailService(),
    )

    await useCase.execute({ listingId: 'listing-1', userId: 'user-1' })

    expect(gateway.cancelSubscription).toHaveBeenCalledWith('sub-flow-123')
    const savedSub = (subRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(savedSub.status).toBe(SubscriptionStatus.CANCELLED)
    const savedListing = (listingRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(savedListing.plan).toBe(ListingPlan.FREE)
  })

  it('lanza error si no hay suscripción activa', async () => {
    const sub = makeSubscription({ status: SubscriptionStatus.CANCELLED })
    const listing = makeListing()
    const listingRepo = mockListingRepo({ findById: vi.fn().mockResolvedValue(listing) })
    const subRepo = mockSubRepo({ findByListingId: vi.fn().mockResolvedValue(sub) })
    const useCase = new CancelSubscriptionUseCase(
      listingRepo,
      subRepo,
      mockPaymentGateway(),
      mockStorageService(),
      mockEmailService(),
    )

    await expect(
      useCase.execute({ listingId: 'listing-1', userId: 'user-1' }),
    ).rejects.toBeInstanceOf(SubscriptionNotActiveError)
  })
})
