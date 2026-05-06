import { FeedItem } from '@domain/feed/FeedItem'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { FeedRepository } from '../ports/FeedRepository'
import { UserRepository } from '../ports/UserRepository'

export interface GetUserFeedOutput {
  items: FeedItem[]
}

export class GetUserFeedUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly feedRepo: FeedRepository,
  ) {}

  async execute(userId: string, limit = 20): Promise<GetUserFeedOutput> {
    const user = await this.userRepo.findById(userId)
    if (!user) throw new UserNotFoundError(userId)

    const items = await this.feedRepo.findByUserId(userId, limit)
    return { items }
  }
}
