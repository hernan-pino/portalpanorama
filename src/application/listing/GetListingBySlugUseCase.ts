import { Listing } from '@domain/listing/Listing'
import { AnalyticsService } from '../ports/AnalyticsService'
import { ListingRepository } from '../ports/ListingRepository'

export interface GetListingBySlugInput {
  slug: string
  trackView?: boolean
}

export interface GetListingBySlugOutput {
  listing: Listing
}

export class GetListingBySlugUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async execute(input: GetListingBySlugInput): Promise<GetListingBySlugOutput | null> {
    const listing = await this.listingRepo.findBySlug(input.slug)
    if (!listing) return null

    if (input.trackView) {
      // fire-and-forget: analytics no bloquea la respuesta
      this.analyticsService.trackView(listing.id).catch(() => undefined)
    }

    return { listing }
  }
}
