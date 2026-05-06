import { createId } from '@paralleldrive/cuid2'
import { Listing } from '@domain/listing/Listing'
import { ListingPlan } from '@domain/listing/ListingPlan'
import { ListingStatus } from '@domain/listing/ListingStatus'
import { Neighborhood } from '@domain/shared/Neighborhoods'
import { Slug } from '@domain/shared/Slug'
import { ListingRepository } from '../ports/ListingRepository'

export interface CreateListingInput {
  name: string
  description?: string
  categoryId: string
  neighborhood: Neighborhood
  address?: string
  phone?: string
  website?: string
  priceRange?: 1 | 2 | 3 | 4
  ownerId: string
}

export interface CreateListingOutput {
  listing: Listing
}

export class CreateListingUseCase {
  constructor(private readonly listingRepo: ListingRepository) {}

  async execute(input: CreateListingInput): Promise<CreateListingOutput> {
    const slug = await this.buildUniqueSlug(input.name)
    const now = new Date()

    const listing = Listing.create({
      id: createId(),
      slug,
      name: input.name,
      description: input.description,
      plan: ListingPlan.FREE,
      status: ListingStatus.DRAFT,
      categoryId: input.categoryId,
      neighborhood: input.neighborhood,
      address: input.address,
      phone: input.phone,
      website: input.website,
      priceRange: input.priceRange,
      ownerId: input.ownerId,
      images: [],
      tags: [],
      createdAt: now,
      updatedAt: now,
    })

    await this.listingRepo.save(listing)
    return { listing }
  }

  private async buildUniqueSlug(name: string): Promise<Slug> {
    const base = Slug.generate(name)
    let candidate = base
    let attempt = 0

    while (await this.listingRepo.findBySlug(candidate.value)) {
      attempt++
      candidate = Slug.fromExisting(`${base.value}-${attempt}`)
    }

    return candidate
  }
}
