import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { UserRepository } from '../ports/UserRepository'

export interface RemoveFavoriteInput {
  userId: string
  listingId: string
}

export class RemoveFavoriteUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: RemoveFavoriteInput): Promise<void> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new UserNotFoundError(input.userId)

    await this.userRepo.removeFavorite(input.userId, input.listingId)
  }
}
