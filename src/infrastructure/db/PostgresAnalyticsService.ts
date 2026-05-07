import { PrismaClient } from '@prisma/client'
import { AnalyticsService, ListingStats } from '@application/ports/AnalyticsService'

export class PostgresAnalyticsService implements AnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async trackView(listingId: string): Promise<void> {
    await this.prisma.listingAnalytics.upsert({
      where: { listingId },
      create: { listingId, viewCount: 1, clickCount: 0 },
      update: { viewCount: { increment: 1 } },
    })
  }

  async trackClick(listingId: string): Promise<void> {
    await this.prisma.listingAnalytics.upsert({
      where: { listingId },
      create: { listingId, viewCount: 0, clickCount: 1 },
      update: { clickCount: { increment: 1 } },
    })
  }

  async getStats(listingId: string): Promise<ListingStats> {
    const row = await this.prisma.listingAnalytics.findUnique({ where: { listingId } })
    return {
      views: row?.viewCount ?? 0,
      clicks: row?.clickCount ?? 0,
    }
  }
}
