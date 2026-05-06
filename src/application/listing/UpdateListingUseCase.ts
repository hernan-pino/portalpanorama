import { Listing, ListingProps } from '@domain/listing/Listing'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { Neighborhood } from '@domain/shared/Neighborhoods'
import { Slug } from '@domain/shared/Slug'
import { FeedItem } from '@domain/feed/FeedItem'
import { FeedItemType } from '@domain/feed/FeedItemType'
import { createId } from '@paralleldrive/cuid2'
import { FeedRepository } from '../ports/FeedRepository'
import { ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'

export interface UpdateListingInput {
  listingId: string
  userId: string
  name?: string
  description?: string
  categoryId?: string
  neighborhood?: Neighborhood
  address?: string
  phone?: string
  website?: string
  priceRange?: 1 | 2 | 3 | 4
}

export interface UpdateListingOutput {
  listing: Listing
}

export class UpdateListingUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
    private readonly feedRepo: FeedRepository,
  ) {}

  async execute(input: UpdateListingInput): Promise<UpdateListingOutput> {
    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    listing.assertOwnership(input.userId)

    const newName = input.name ?? listing.name
    const slug =
      input.name && input.name !== listing.name
        ? await this.buildUniqueSlug(input.name, listing.slug.value)
        : listing.slug

    const updatedProps: ListingProps = {
      id: listing.id,
      slug,
      name: newName,
      description: input.description !== undefined ? input.description : listing.description,
      plan: listing.plan,
      status: listing.status,
      categoryId: input.categoryId ?? listing.categoryId,
      neighborhood: input.neighborhood ?? listing.neighborhood,
      address: input.address !== undefined ? input.address : listing.address,
      phone: input.phone !== undefined ? input.phone : listing.phone,
      website: input.website !== undefined ? input.website : listing.website,
      priceRange: input.priceRange !== undefined ? input.priceRange : listing.priceRange,
      ownerId: listing.ownerId,
      images: listing.images,
      tags: listing.tags,
      pricePerMonth: listing.pricePerMonth,
      createdAt: listing.createdAt,
      updatedAt: new Date(),
    }

    const updated = Listing.create(updatedProps)
    await this.listingRepo.save(updated)

    if (updated.isPublished()) {
      await this.notifyFollowers(updated)
    }

    return { listing: updated }
  }

  private async buildUniqueSlug(name: string, currentSlug: string): Promise<Slug> {
    const base = Slug.generate(name)
    if (base.value === currentSlug) return base

    let candidate = base
    let attempt = 0

    while (await this.listingRepo.findBySlug(candidate.value)) {
      attempt++
      candidate = Slug.fromExisting(`${base.value}-${attempt}`)
    }

    return candidate
  }

  private async notifyFollowers(listing: Listing): Promise<void> {
    const followerIds = await this.userRepo.findUserIdsWithFavorite(listing.id)
    await Promise.all(
      followerIds.map((userId) =>
        this.feedRepo.createItem(
          FeedItem.create({
            id: createId(),
            userId,
            listingId: listing.id,
            type: FeedItemType.INFO_UPDATED,
            read: false,
            createdAt: new Date(),
          }),
        ),
      ),
    )
  }
}
