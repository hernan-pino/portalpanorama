import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'

export interface SaveFavoriteInput {
  userId: string
  listingId: string
}

export class SaveFavoriteUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly listingRepo: ListingRepository,
  ) {}

  async execute(input: SaveFavoriteInput): Promise<void> {
    const [user, listing] = await Promise.all([
      this.userRepo.findById(input.userId),
      this.listingRepo.findById(input.listingId),
    ])

    if (!user) throw new UserNotFoundError(input.userId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    const already = await this.userRepo.isFavorite(input.userId, input.listingId)
    if (already) return

    await this.userRepo.addFavorite(input.userId, input.listingId)
  }
}
