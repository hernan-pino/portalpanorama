export interface ListingUpdatedEvent {
  readonly type: 'ListingUpdated'
  readonly occurredAt: Date
  readonly listingId: string
  readonly changedFields: string[]
}
