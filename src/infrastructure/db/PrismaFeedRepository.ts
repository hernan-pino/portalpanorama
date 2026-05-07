import { type Prisma, PrismaClient } from '@prisma/client'
import { FeedItem } from '@domain/feed/FeedItem'
import { FeedItemType } from '@domain/feed/FeedItemType'
import { FeedRepository } from '@application/ports/FeedRepository'

type FeedItemRow = Prisma.FeedItemGetPayload<Record<string, never>>

function toFeedItemDomain(row: FeedItemRow): FeedItem {
  return FeedItem.create({
    id: row.id,
    userId: row.userId,
    listingId: row.listingId,
    type: row.type as FeedItemType,
    payload: (row.payload as Record<string, unknown>) ?? undefined,
    read: row.read,
    createdAt: row.createdAt,
  })
}

export class PrismaFeedRepository implements FeedRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createItem(item: FeedItem): Promise<void> {
    await this.prisma.feedItem.create({
      data: {
        id: item.id,
        userId: item.userId,
        listingId: item.listingId,
        type: item.type,
        payload: (item.payload ?? {}) as Prisma.InputJsonValue,
        read: item.read,
        createdAt: item.createdAt,
      },
    })
  }

  async findByUserId(userId: string, limit = 50): Promise<FeedItem[]> {
    const rows = await this.prisma.feedItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return rows.map(toFeedItemDomain)
  }

  async markAsRead(itemId: string): Promise<void> {
    await this.prisma.feedItem.update({
      where: { id: itemId },
      data: { read: true },
    })
  }
}
