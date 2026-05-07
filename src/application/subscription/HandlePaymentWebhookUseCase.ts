import { createId } from '@paralleldrive/cuid2'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { Money } from '@domain/shared/Money'
import { Subscription } from '@domain/subscription/Subscription'
import { SubscriptionStatus } from '@domain/subscription/SubscriptionStatus'
import { EmailService } from '../ports/EmailService'
import { ListingRepository } from '../ports/ListingRepository'
import { PaymentGateway } from '../ports/PaymentGateway'
import { SubscriptionRepository } from '../ports/SubscriptionRepository'
import { UserRepository } from '../ports/UserRepository'

export class HandlePaymentWebhookUseCase {
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(payload: unknown, signature: string, timestampHeader: string): Promise<void> {
    const event = await this.paymentGateway.parseWebhookEvent(payload, signature, timestampHeader)

    switch (event.type) {
      case 'subscription.activated':
        await this.handleActivated(
          event.listingId,
          event.flowSubId,
          event.flowPlanId,
          event.pricePerMonth,
          event.currentPeriodEnd,
        )
        break
      case 'payment.failed':
        await this.handlePaymentFailed(event.flowSubId)
        break
      case 'subscription.cancelled':
        await this.handleCancelled(event.flowSubId)
        break
    }
  }

  private async handleActivated(
    listingId: string,
    flowSubId: string,
    flowPlanId: string,
    pricePerMonth: Money,
    currentPeriodEnd?: Date,
  ): Promise<void> {
    // Idempotencia: Flow puede re-entregar el webhook por timeout. Si ya existe, ignorar.
    const existing = await this.subscriptionRepo.findByFlowSubId(flowSubId)
    if (existing) return

    const listing = await this.listingRepo.findById(listingId)
    if (!listing) throw new ListingNotFoundError(listingId)

    const subscription = Subscription.create({
      id: createId(),
      listingId,
      userId: listing.ownerId,
      status: SubscriptionStatus.ACTIVE,
      flowPlanId,
      flowSubId,
      pricePerMonth,
      currentPeriodEnd,
      createdAt: new Date(),
    })

    await this.subscriptionRepo.save(subscription)

    const upgraded = listing.upgradeToPremium()
    await this.listingRepo.save(upgraded)
  }

  private async handlePaymentFailed(flowSubId: string): Promise<void> {
    const subscription = await this.subscriptionRepo.findByFlowSubId(flowSubId)
    if (!subscription) return

    const pastDue = subscription.markAsPastDue()
    await this.subscriptionRepo.save(pastDue)

    const listing = await this.listingRepo.findById(subscription.listingId)
    const owner = listing ? await this.userRepo.findById(listing.ownerId) : null
    if (owner && listing) {
      await this.emailService.sendPaymentFailed(owner.email.value, listing.name)
    }
  }

  private async handleCancelled(flowSubId: string): Promise<void> {
    const subscription = await this.subscriptionRepo.findByFlowSubId(flowSubId)
    if (!subscription) return

    const cancelled = subscription.cancel()
    await this.subscriptionRepo.save(cancelled)

    const listing = await this.listingRepo.findById(subscription.listingId)
    if (!listing) return

    const downgraded = listing.downgradeToFree()
    await this.listingRepo.save(downgraded)

    const owner = await this.userRepo.findById(listing.ownerId)
    if (owner) {
      await this.emailService.sendSubscriptionCancelled(owner.email.value, listing.name)
    }
  }
}
