export interface ListingClaimedEvent {
  readonly type: 'ListingClaimed'
  readonly occurredAt: Date
  readonly listingId: string
  readonly claimId: string
  readonly claimantId: string
}
