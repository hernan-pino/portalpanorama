import { Listing } from '@domain/listing/Listing'
import { ListingClaim } from '@domain/listing/ListingClaim'

export interface PendingClaimView {
  claimId: string
  listingId: string
  listingName: string
  listingSlug: string
  claimantId: string
  claimantName: string
  claimantEmail: string
  message?: string
  createdAt: Date
}

export interface PendingTagView {
  tagId: string
  tagName: string
  tagSlug: string
  listingId: string
  listingName: string
  listingSlug: string
}

export interface ListingRepository {
  findById(id: string): Promise<Listing | null>
  findBySlug(slug: string): Promise<Listing | null>
  findByOwnerId(ownerId: string): Promise<Listing[]>
  save(listing: Listing): Promise<void>
  findClaimById(id: string): Promise<ListingClaim | null>
  findPendingClaimByListingId(listingId: string): Promise<ListingClaim | null>
  saveClaim(claim: ListingClaim): Promise<void>
  findPendingClaims(): Promise<PendingClaimView[]>
  findPendingTags(): Promise<PendingTagView[]>
}
