import { PrismaClient } from '@prisma/client'
import { Listing } from '@domain/listing/Listing'
import { SearchService, SearchParams, SearchResult, SearchResultItem } from '@application/ports/SearchService'

export class PostgresFTSSearchService implements SearchService {
  constructor(private readonly prisma: PrismaClient) {}

  async search(params: SearchParams): Promise<SearchResult> {
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId
    }

    if (params.neighborhood) {
      where.neighborhood = params.neighborhood
    }

    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { description: { contains: params.query, mode: 'insensitive' } },
        { tags: { some: { name: { contains: params.query, mode: 'insensitive' }, status: 'ACTIVE' } } },
      ]
    }

    const [rows, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          categoryId: true,
          neighborhood: true,
          _count: { select: { reviews: true } },
          reviews: { select: { rating: true } },
        },
        orderBy: [{ plan: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ])

    const items: SearchResultItem[] = rows.map((row) => {
      const avgRating =
        row.reviews.length > 0
          ? row.reviews.reduce((sum, r) => sum + r.rating, 0) / row.reviews.length
          : undefined

      return {
        listingId: row.id,
        name: row.name,
        slug: row.slug,
        categoryId: row.categoryId,
        neighborhood: row.neighborhood,
        averageRating: avgRating,
      }
    })

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  // In Postgres FTS mode, indexing is a no-op — the DB table IS the index
  async indexListing(_listing: Listing): Promise<void> {}

  async removeListing(_listingId: string): Promise<void> {}
}
