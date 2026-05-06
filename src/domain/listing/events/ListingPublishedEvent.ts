export interface ListingPublishedEvent {
  readonly type: 'ListingPublished'
  readonly occurredAt: Date
  readonly listingId: string
  readonly slug: string
  readonly ownerId: string
}
