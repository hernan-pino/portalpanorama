import { Listing, ListingProps } from '@domain/listing/Listing'
import { ListingClaim } from '@domain/listing/ListingClaim'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { UserRole } from '@domain/user/UserRole'
import { DomainError } from '@domain/shared/DomainError'
import { UnauthorizedError } from '../errors'
import { EmailService } from '../ports/EmailService'
import { ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'

export class ClaimNotFoundError extends DomainError {
  readonly code = 'CLAIM_NOT_FOUND'
  constructor(claimId: string) {
    super(`Claim "${claimId}" no encontrado`)
  }
}

export class ClaimNotPendingError extends DomainError {
  readonly code = 'CLAIM_NOT_PENDING'
  constructor(claimId: string) {
    super(`El claim "${claimId}" ya fue resuelto`)
  }
}

export interface ResolveListingClaimInput {
  claimId: string
  adminId: string
  decision: 'APPROVE' | 'REJECT'
  reviewNote?: string
}

export interface ResolveListingClaimOutput {
  claim: ListingClaim
}

export class ResolveListingClaimUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: ResolveListingClaimInput): Promise<ResolveListingClaimOutput> {
    const admin = await this.userRepo.findById(input.adminId)
    if (!admin || !admin.isAdmin()) throw new UnauthorizedError('Solo admins pueden resolver claims')

    const claim = await this.listingRepo.findClaimById(input.claimId)
    if (!claim) throw new ClaimNotFoundError(input.claimId)
    if (!claim.isPending()) throw new ClaimNotPendingError(input.claimId)

    if (input.decision === 'APPROVE') {
      return this.approve(claim, input.reviewNote)
    } else {
      return this.reject(claim, input.reviewNote)
    }
  }

  private async approve(
    claim: ListingClaim,
    reviewNote?: string,
  ): Promise<ResolveListingClaimOutput> {
    const listing = await this.listingRepo.findById(claim.listingId)
    if (!listing) throw new ListingNotFoundError(claim.listingId)

    const claimant = await this.userRepo.findById(claim.claimantId)
    if (!claimant) throw new UserNotFoundError(claim.claimantId)

    const claimedListing = listing.claim()
    const transferred = Listing.create(this.withNewOwner(claimedListing, claim.claimantId))
    await this.listingRepo.save(transferred)

    if (!claimant.isBusinessOwner()) {
      await this.userRepo.save(claimant.withRole(UserRole.BUSINESS_OWNER))
    }

    const resolvedClaim = claim.approve(reviewNote)
    await this.listingRepo.saveClaim(resolvedClaim)

    await this.emailService.sendClaimApproved(claimant.email.value, listing.name)

    return { claim: resolvedClaim }
  }

  private async reject(
    claim: ListingClaim,
    reviewNote?: string,
  ): Promise<ResolveListingClaimOutput> {
    const claimant = await this.userRepo.findById(claim.claimantId)
    const listing = await this.listingRepo.findById(claim.listingId)

    const resolvedClaim = claim.reject(reviewNote)
    await this.listingRepo.saveClaim(resolvedClaim)

    if (claimant && listing) {
      await this.emailService.sendClaimRejected(claimant.email.value, listing.name, reviewNote)
    }

    return { claim: resolvedClaim }
  }

  private withNewOwner(listing: Listing, newOwnerId: string): ListingProps {
    return {
      id: listing.id,
      slug: listing.slug,
      name: listing.name,
      description: listing.description,
      plan: listing.plan,
      status: listing.status,
      categoryId: listing.categoryId,
      neighborhood: listing.neighborhood,
      address: listing.address,
      phone: listing.phone,
      website: listing.website,
      priceRange: listing.priceRange,
      ownerId: newOwnerId,
      images: listing.images,
      tags: listing.tags,
      pricePerMonth: listing.pricePerMonth,
      createdAt: listing.createdAt,
      updatedAt: new Date(),
    }
  }
}
