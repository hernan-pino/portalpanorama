import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import {
  GoogleReviewDTO,
  GoogleReviewRepository,
} from '@application/ports/GoogleReviewRepository'

export class PrismaGoogleReviewRepository implements GoogleReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByListingId(listingId: string): Promise<GoogleReviewDTO[]> {
    const rows = await this.prisma.googleReview.findMany({
      where: { listingId },
      orderBy: { publishedAt: 'desc' },
    })
    return rows.map((row) => ({
      id: row.id,
      listingId: row.listingId,
      authorName: row.authorName,
      rating: row.rating,
      body: row.body,
      publishedAt: row.publishedAt,
    }))
  }

  async upsertMany(
    listingId: string,
    reviews: Omit<GoogleReviewDTO, 'id' | 'listingId'>[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.googleReview.deleteMany({ where: { listingId } })
      if (reviews.length > 0) {
        await tx.googleReview.createMany({
          data: reviews.map((r) => ({
            id: createId(),
            listingId,
            authorName: r.authorName,
            rating: r.rating,
            body: r.body,
            publishedAt: r.publishedAt,
          })),
        })
      }
    })
  }
}
