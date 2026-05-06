import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { Money } from '@domain/shared/Money'
import { SubscriptionStatus } from '@domain/subscription/SubscriptionStatus'
import { ListingRepository } from '../ports/ListingRepository'
import { PaymentGateway } from '../ports/PaymentGateway'
import { SubscriptionAlreadyExistsError } from '../errors'
import { SubscriptionRepository } from '../ports/SubscriptionRepository'

export interface CreateSubscriptionInput {
  listingId: string
  userId: string
  flowPlanId: string
  pricePerMonth: Money
  returnUrl: string
}

export interface CreateSubscriptionOutput {
  paymentUrl: string
}

export class CreateSubscriptionUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(input: CreateSubscriptionInput): Promise<CreateSubscriptionOutput> {
    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    listing.assertOwnership(input.userId)

    const existing = await this.subscriptionRepo.findByListingId(input.listingId)
    if (existing && existing.status === SubscriptionStatus.ACTIVE) {
      throw new SubscriptionAlreadyExistsError(input.listingId)
    }

    const { paymentUrl } = await this.paymentGateway.createSubscription({
      listingId: input.listingId,
      flowPlanId: input.flowPlanId,
      pricePerMonth: input.pricePerMonth,
      returnUrl: input.returnUrl,
    })

    return { paymentUrl }
  }
}
