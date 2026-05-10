import { Listing } from '@domain/listing/Listing'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { SubscriptionStatus } from '@domain/subscription/SubscriptionStatus'
import { SubscriptionNotActiveError } from '@domain/subscription/errors/SubscriptionNotActiveError'
import { EmailService } from '../ports/EmailService'
import { ListingRepository } from '../ports/ListingRepository'
import { PaymentGateway } from '../ports/PaymentGateway'
import { StorageService } from '../ports/StorageService'
import { SubscriptionNotFoundError } from '../errors'
import { SubscriptionRepository } from '../ports/SubscriptionRepository'

export interface CancelSubscriptionInput {
  listingId: string
  userId: string
}

export class CancelSubscriptionUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly paymentGateway: PaymentGateway,
    private readonly storageService: StorageService,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: CancelSubscriptionInput): Promise<void> {
    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    listing.assertOwnership(input.userId)

    const subscription = await this.subscriptionRepo.findByListingId(input.listingId)
    if (!subscription) throw new SubscriptionNotFoundError(input.listingId)
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new SubscriptionNotActiveError(input.listingId)
    }

    if (subscription.flowSubId) {
      await this.paymentGateway.cancelSubscription(subscription.flowSubId)
    }

    const cancelled = subscription.cancel()
    await this.subscriptionRepo.save(cancelled)

    const downgraded = listing.downgradeToFree()
    const removedImages = listing.images.filter(
      (img) => !downgraded.images.some((kept) => kept.id === img.id),
    )
    await this.listingRepo.save(downgraded)

    await Promise.all(removedImages.map((img) => this.storageService.delete(img.url)))

    const owner = await this.findOwnerEmail(listing)
    if (owner) {
      await this.emailService.sendSubscriptionCancelled(owner, listing.name)
    }
  }

  private async findOwnerEmail(_listing: Listing): Promise<string | null> {
    // El listingRepo no tiene método findOwner; la dirección se pasa desde afuera si fuera necesario.
    // Por ahora retornamos null: el email de cancelación lo maneja el webhook de Flow también.
    return null
  }
}
