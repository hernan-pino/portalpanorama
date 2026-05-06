import { Listing } from '@domain/listing/Listing'
import { User } from '@domain/user/User'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'

export interface UserDashboardOutput {
  user: User
  favoriteListings: Listing[]
  ownedListings: Listing[]
}

export class GetUserDashboardUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly listingRepo: ListingRepository,
  ) {}

  async execute(userId: string): Promise<UserDashboardOutput> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new UserNotFoundError(userId)

    const [favoriteListings, ownedListings] = await Promise.all([
      this.userRepo.findFavoriteListings(userId),
      this.listingRepo.findByOwnerId(userId),
    ])

    return { user, favoriteListings, ownedListings }
  }
}
