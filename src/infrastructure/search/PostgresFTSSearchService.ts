import { PrismaClient, Prisma } from '@prisma/client'
import { Listing } from '@domain/listing/Listing'
import { SearchService, SearchParams, SearchResult, SearchResultItem, CategoryFacet } from '@application/ports/SearchService'

export class PostgresFTSSearchService implements SearchService {
  constructor(private readonly prisma: PrismaClient) {}

  async search(params: SearchParams): Promise<SearchResult> {
    const page = params.page ?? 1
    const limit = params.limit ?? 20
    const skip = (page - 1) * limit

    const where: Prisma.ListingWhereInput = {
      status: 'PUBLISHED',
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId
    }

    if (params.categorySlug) {
      where.category = { slug: params.categorySlug }
    }

    if (params.neighborhood) {
      where.neighborhood = params.neighborhood
    }

    if (params.commune) {
      where.commune = params.commune
    }

    if (params.priceRanges && params.priceRanges.length > 0) {
      where.priceRange = { in: params.priceRanges }
    }

    if (params.isPremium) {
      where.plan = 'PREMIUM'
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
        include: {
          category: { select: { name: true } },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
          tags: { select: { name: true, status: true } },
          images: { select: { url: true, order: true }, orderBy: { order: 'asc' }, take: 1 },
        },
        orderBy: [{ plan: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ])

    const items: SearchResultItem[] = rows.map((row) => {
      const hasInternalReviews = row._count.reviews > 0
      const avgRating = hasInternalReviews
        ? row.reviews.reduce((sum, r) => sum + r.rating, 0) / row.reviews.length
        : row.googleRating != null
          ? row.googleRating * 2  // normalize Google 1-5 to platform 1-10 scale for display
          : undefined
      const reviewCount = hasInternalReviews
        ? row._count.reviews
        : (row.googleReviewCount ?? 0)
      const isGoogleRating = !hasInternalReviews && row.googleRating != null

      return {
        listingId: row.id,
        name: row.name,
        slug: row.slug,
        categoryId: row.categoryId,
        categoryName: row.category.name,
        neighborhood: row.neighborhood,
        commune: row.commune ?? undefined,
        description: row.description ?? undefined,
        coverUrl: row.images[0]?.url,
        priceRange: row.priceRange ?? undefined,
        isPremium: row.plan === 'PREMIUM',
        averageRating: avgRating,
        reviewCount,
        isGoogleRating,
        tags: row.tags.filter((t) => t.status === 'ACTIVE').map((t) => t.name),
      }
    })

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getCategoryFacets(): Promise<CategoryFacet[]> {
    const groups = await this.prisma.listing.groupBy({
      by: ['categoryId'],
      where: { status: 'PUBLISHED' },
      _count: { id: true },
    })
    if (groups.length === 0) return []
    const categories = await this.prisma.category.findMany({
      where: { id: { in: groups.map((g) => g.categoryId) } },
      select: { id: true, slug: true },
    })
    const slugMap = Object.fromEntries(categories.map((c) => [c.id, c.slug]))
    return groups.map((g) => ({ categorySlug: slugMap[g.categoryId] ?? '', count: g._count.id }))
  }

  // In Postgres FTS mode, indexing is a no-op — the DB table IS the index
  async indexListing(_l: Listing): Promise<void> {}

  async removeListing(_: string): Promise<void> {}
}
