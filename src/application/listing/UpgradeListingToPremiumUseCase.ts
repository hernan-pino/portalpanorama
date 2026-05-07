import { Listing } from '@domain/listing/Listing'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { UnauthorizedError } from '../errors'
import { ListingRepository } from '../ports/ListingRepository'
import { SearchService } from '../ports/SearchService'
import { UserRepository } from '../ports/UserRepository'

export interface UpgradeListingToPremiumInput {
  listingId: string
  adminId: string
}

export interface UpgradeListingToPremiumOutput {
  listing: Listing
}

// Use case de uso exclusivo para admins (override manual / períodos promocionales).
// El flujo normal de upgrade va por HandlePaymentWebhookUseCase al confirmar el pago en Flow.
export class UpgradeListingToPremiumUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
    private readonly searchService: SearchService,
  ) {}

  async execute(input: UpgradeListingToPremiumInput): Promise<UpgradeListingToPremiumOutput> {
    const admin = await this.userRepo.findById(input.adminId)
    if (!admin) throw new UserNotFoundError(input.adminId)
    if (!admin.isAdmin()) throw new UnauthorizedError('Solo admins pueden hacer upgrade manual a PREMIUM')

    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    const upgraded = listing.upgradeToPremium()
    await this.listingRepo.save(upgraded)

    if (upgraded.isPublished()) {
      await this.searchService.indexListing(upgraded)
    }

    return { listing: upgraded }
  }
}
