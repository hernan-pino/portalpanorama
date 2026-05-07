import { Prisma, PrismaClient } from '@prisma/client'
import { Listing, ListingImage, ListingTag } from '@domain/listing/Listing'
import { ListingClaim, ClaimStatus } from '@domain/listing/ListingClaim'
import { ListingPlan } from '@domain/listing/ListingPlan'
import { ListingStatus } from '@domain/listing/ListingStatus'
import { TagStatus } from '@domain/listing/TagStatus'
import { Money } from '@domain/shared/Money'
import { Slug } from '@domain/shared/Slug'
import { isValidNeighborhood } from '@domain/shared/Neighborhoods'
import { ListingRepository } from '@application/ports/ListingRepository'

type ListingRow = Prisma.ListingGetPayload<{
  include: { images: true; tags: true }
}>

type ClaimRow = Prisma.ListingClaimGetPayload<Record<string, never>>

export function toListingDomain(row: ListingRow): Listing {
  if (!isValidNeighborhood(row.neighborhood)) {
    throw new Error(`Neighborhood inválido en DB: ${row.neighborhood}`)
  }

  const images: ListingImage[] = row.images
    .sort((a, b) => a.order - b.order)
    .map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? undefined,
      order: img.order,
    }))

  const tags: ListingTag[] = row.tags.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    status: t.status as TagStatus,
  }))

  return Listing.create({
    id: row.id,
    slug: Slug.fromExisting(row.slug),
    name: row.name,
    description: row.description ?? undefined,
    plan: row.plan as ListingPlan,
    status: row.status as ListingStatus,
    categoryId: row.categoryId,
    neighborhood: row.neighborhood,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    priceRange: (row.priceRange as 1 | 2 | 3 | 4 | undefined) ?? undefined,
    ownerId: row.ownerId,
    images,
    tags,
    pricePerMonth: row.pricePerMonthAmount != null ? Money.create(row.pricePerMonthAmount) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

function toClaimDomain(row: ClaimRow): ListingClaim {
  return ListingClaim.create({
    id: row.id,
    listingId: row.listingId,
    claimantId: row.claimantId,
    status: row.status as ClaimStatus,
    message: row.message ?? undefined,
    reviewNote: row.reviewNote ?? undefined,
    createdAt: row.createdAt,
    resolvedAt: row.resolvedAt ?? undefined,
  })
}

const LISTING_INCLUDE = { images: true, tags: true } as const

export class PrismaListingRepository implements ListingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Listing | null> {
    const row = await this.prisma.listing.findUnique({
      where: { id },
      include: LISTING_INCLUDE,
    })
    return row ? toListingDomain(row) : null
  }

  async findBySlug(slug: string): Promise<Listing | null> {
    const row = await this.prisma.listing.findUnique({
      where: { slug },
      include: LISTING_INCLUDE,
    })
    return row ? toListingDomain(row) : null
  }

  async findByOwnerId(ownerId: string): Promise<Listing[]> {
    const rows = await this.prisma.listing.findMany({
      where: { ownerId },
      include: LISTING_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(toListingDomain)
  }

  async save(listing: Listing): Promise<void> {
    const data = {
      slug: listing.slug.value,
      name: listing.name,
      description: listing.description ?? null,
      plan: listing.plan,
      status: listing.status,
      categoryId: listing.categoryId,
      neighborhood: listing.neighborhood,
      address: listing.address ?? null,
      phone: listing.phone ?? null,
      website: listing.website ?? null,
      priceRange: listing.priceRange ?? null,
      ownerId: listing.ownerId,
      pricePerMonthAmount: listing.pricePerMonth?.amount ?? null,
      updatedAt: listing.updatedAt,
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.listing.upsert({
        where: { id: listing.id },
        create: { id: listing.id, createdAt: listing.createdAt, ...data },
        update: data,
      })

      // Replace images and tags as part of the aggregate
      await tx.listingImage.deleteMany({ where: { listingId: listing.id } })
      if (listing.images.length > 0) {
        await tx.listingImage.createMany({
          data: listing.images.map((img) => ({
            id: img.id,
            listingId: listing.id,
            url: img.url,
            alt: img.alt ?? null,
            order: img.order,
          })),
        })
      }

      await tx.listingTag.deleteMany({ where: { listingId: listing.id } })
      if (listing.tags.length > 0) {
        await tx.listingTag.createMany({
          data: listing.tags.map((tag) => ({
            id: tag.id,
            listingId: listing.id,
            slug: tag.slug,
            name: tag.name,
            status: tag.status,
          })),
        })
      }
    })
  }

  async findClaimById(id: string): Promise<ListingClaim | null> {
    const row = await this.prisma.listingClaim.findUnique({ where: { id } })
    return row ? toClaimDomain(row) : null
  }

  async findPendingClaimByListingId(listingId: string): Promise<ListingClaim | null> {
    const row = await this.prisma.listingClaim.findFirst({
      where: { listingId, status: 'PENDING' },
    })
    return row ? toClaimDomain(row) : null
  }

  async saveClaim(claim: ListingClaim): Promise<void> {
    const data = {
      listingId: claim.listingId,
      claimantId: claim.claimantId,
      status: claim.status,
      message: claim.message ?? null,
      reviewNote: claim.reviewNote ?? null,
      resolvedAt: claim.resolvedAt ?? null,
    }

    await this.prisma.listingClaim.upsert({
      where: { id: claim.id },
      create: { id: claim.id, createdAt: claim.createdAt, ...data },
      update: data,
    })
  }
}
