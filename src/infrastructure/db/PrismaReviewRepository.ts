import { Prisma, PrismaClient } from '@prisma/client'
import { Review } from '@domain/review/Review'
import { ReviewRepository, ReviewStats } from '@application/ports/ReviewRepository'

type ReviewRow = Prisma.ReviewGetPayload<Record<string, never>>

function toReviewDomain(row: ReviewRow): Review {
  return Review.create({
    id: row.id,
    listingId: row.listingId,
    userId: row.userId,
    rating: row.rating,
    body: row.body,
    response: row.response ?? undefined,
    createdAt: row.createdAt,
  })
}

export class PrismaReviewRepository implements ReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Review | null> {
    const row = await this.prisma.review.findUnique({ where: { id } })
    return row ? toReviewDomain(row) : null
  }

  async findByListingId(listingId: string): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toReviewDomain)
  }

  async findByUserAndListing(userId: string, listingId: string): Promise<Review | null> {
    const row = await this.prisma.review.findUnique({
      where: { listingId_userId: { listingId, userId } },
    })
    return row ? toReviewDomain(row) : null
  }

  async getStats(listingId: string): Promise<ReviewStats> {
    const result = await this.prisma.review.aggregate({
      where: { listingId },
      _count: { id: true },
      _avg: { rating: true },
    })
    return {
      count: result._count.id,
      averageRating: result._avg.rating ?? 0,
    }
  }

  async save(review: Review): Promise<void> {
    const data = {
      listingId: review.listingId,
      userId: review.userId,
      rating: review.rating,
      body: review.body,
      response: review.response ?? null,
    }

    await this.prisma.review.upsert({
      where: { id: review.id },
      create: { id: review.id, createdAt: review.createdAt, ...data },
      update: data,
    })
  }
}
