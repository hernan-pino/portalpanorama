import { Listing } from '@domain/listing/Listing'
import { User } from '@domain/user/User'

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: User, passwordHash: string): Promise<void>
  save(user: User): Promise<void>
  addFavorite(userId: string, listingId: string): Promise<void>
  removeFavorite(userId: string, listingId: string): Promise<void>
  isFavorite(userId: string, listingId: string): Promise<boolean>
  findFavoriteListings(userId: string): Promise<Listing[]>
  findUserIdsWithFavorite(listingId: string): Promise<string[]>
}
