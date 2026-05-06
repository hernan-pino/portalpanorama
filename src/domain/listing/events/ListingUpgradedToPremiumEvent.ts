export interface ListingUpgradedToPremiumEvent {
  readonly type: 'ListingUpgradedToPremium'
  readonly occurredAt: Date
  readonly listingId: string
  readonly ownerId: string
}
