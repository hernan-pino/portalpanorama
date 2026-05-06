import { Subscription } from '@domain/subscription/Subscription'

export interface SubscriptionRepository {
  findByListingId(listingId: string): Promise<Subscription | null>
  findByFlowSubId(flowSubId: string): Promise<Subscription | null>
  save(subscription: Subscription): Promise<void>
}
