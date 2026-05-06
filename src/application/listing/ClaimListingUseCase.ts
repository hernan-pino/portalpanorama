import { createId } from '@paralleldrive/cuid2'
import { ListingClaim, ClaimStatus } from '@domain/listing/ListingClaim'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { ListingAlreadyClaimedError } from '@domain/listing/errors/ListingAlreadyClaimedError'
import { ListingStatus } from '@domain/listing/ListingStatus'
import { DomainError } from '@domain/shared/DomainError'
import { EmailService } from '../ports/EmailService'
import { ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'

export class ListingNotPublishedError extends DomainError {
  readonly code = 'LISTING_NOT_PUBLISHED'
  constructor(listingId: string) {
    super(`El listing "${listingId}" debe estar publicado para poder reclamarlo`)
  }
}

export interface ClaimListingInput {
  listingId: string
  claimantId: string
  message?: string
}

export interface ClaimListingOutput {
  claim: ListingClaim
}

export class ClaimListingUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: ClaimListingInput): Promise<ClaimListingOutput> {
    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    if (listing.status !== ListingStatus.PUBLISHED) {
      throw new ListingNotPublishedError(input.listingId)
    }

    const existingClaim = await this.listingRepo.findPendingClaimByListingId(input.listingId)
    if (existingClaim) throw new ListingAlreadyClaimedError(input.listingId)

    const claimant = await this.userRepo.findById(input.claimantId)
    if (!claimant) throw new ListingNotFoundError(input.claimantId)

    const claim = ListingClaim.create({
      id: createId(),
      listingId: input.listingId,
      claimantId: input.claimantId,
      status: ClaimStatus.PENDING,
      message: input.message,
      createdAt: new Date(),
    })

    await this.listingRepo.saveClaim(claim)

    await this.emailService.sendClaimReceived('admin@portalpanorama.cl', {
      claimantName: claimant.name,
      listingName: listing.name,
      listingId: listing.id,
      message: input.message,
    })

    return { claim }
  }
}
