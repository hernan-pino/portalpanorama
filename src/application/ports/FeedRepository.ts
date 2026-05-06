import { FeedItem } from '@domain/feed/FeedItem'

export interface FeedRepository {
  createItem(item: FeedItem): Promise<void>
  findByUserId(userId: string, limit?: number): Promise<FeedItem[]>
  markAsRead(itemId: string): Promise<void>
}
