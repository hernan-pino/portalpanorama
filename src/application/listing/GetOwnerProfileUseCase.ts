import { ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'

export interface GetOwnerProfileInput {
  ownerId: string
}

export interface OwnerListingDTO {
  slug: string
  name: string
  neighborhood: string
  coverUrl: string | undefined
  isPremium: boolean
  tags: string[]
  priceRange: number | undefined
}

export interface GetOwnerProfileOutput {
  owner: {
    name: string
    memberSince: Date
  }
  listings: OwnerListingDTO[]
}

export class GetOwnerProfileUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly listingRepo: ListingRepository,
  ) {}

  async execute(input: GetOwnerProfileInput): Promise<GetOwnerProfileOutput | null> {
    const owner = await this.userRepo.findById(input.ownerId)
    if (!owner || !owner.isBusinessOwner()) return null

    const allListings = await this.listingRepo.findByOwnerId(input.ownerId)
    const listings: OwnerListingDTO[] = allListings
      .filter((l) => l.isPublished())
      .map((l) => ({
        slug: l.slug.value,
        name: l.name,
        neighborhood: l.neighborhood,
        coverUrl: l.images[0]?.url,
        isPremium: l.isPremium(),
        tags: l.tags.map((t) => t.name),
        priceRange: l.priceRange,
      }))

    return {
      owner: {
        name: owner.name,
        memberSince: owner.createdAt,
      },
      listings,
    }
  }
}
