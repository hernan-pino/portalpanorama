import { Prisma, PrismaClient } from '@prisma/client'
import { Collection } from '@domain/collection/Collection'
import {
  CollectionRepository,
  CollectionSummary,
  CuratedCollectionView,
} from '@application/ports/CollectionRepository'
import { placeCardArgs, toPlaceCardView } from './placeCardView'

const collectionWithItems = Prisma.validator<Prisma.CollectionDefaultArgs>()({
  include: { items: { orderBy: { sortOrder: 'asc' } } },
})
type CollectionRow = Prisma.CollectionGetPayload<typeof collectionWithItems>

function toCollectionDomain(row: CollectionRow): Collection {
  return Collection.create({
    id: row.id,
    name: row.name,
    ownerId: row.ownerId ?? undefined,
    isCurated: row.isCurated,
    slug: row.slug ?? undefined,
    description: row.description ?? undefined,
    items: row.items.map((it) => ({ placeId: it.placeId, sortOrder: it.sortOrder })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export class PrismaCollectionRepository implements CollectionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Collection | null> {
    const row = await this.prisma.collection.findUnique({
      where: { id },
      ...collectionWithItems,
    })
    return row ? toCollectionDomain(row) : null
  }

  // Upsert del encabezado + reemplazo total de items (la colección es el agregado
  // dueño de sus items). En una transacción para no dejar estados a medias.
  async save(collection: Collection): Promise<void> {
    const header = {
      name: collection.name,
      ownerId: collection.ownerId ?? null,
      isCurated: collection.isCurated,
      slug: collection.slug ?? null,
      description: collection.description ?? null,
      updatedAt: collection.updatedAt,
    }
    await this.prisma.$transaction([
      this.prisma.collection.upsert({
        where: { id: collection.id },
        create: { id: collection.id, createdAt: collection.createdAt, ...header },
        update: header,
      }),
      this.prisma.collectionItem.deleteMany({ where: { collectionId: collection.id } }),
      this.prisma.collectionItem.createMany({
        data: collection.items.map((it) => ({
          collectionId: collection.id,
          placeId: it.placeId,
          sortOrder: it.sortOrder,
        })),
      }),
    ])
  }

  async delete(id: string): Promise<void> {
    // Los items caen por onDelete: Cascade.
    await this.prisma.collection.delete({ where: { id } })
  }

  async findByOwnerId(ownerId: string): Promise<CollectionSummary[]> {
    const rows = await this.prisma.collection.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
        items: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
          select: {
            place: {
              select: {
                images: {
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      itemCount: r._count.items,
      coverUrl: r.items[0]?.place.images[0]?.url,
    }))
  }

  async findSavedPlaceIds(ownerId: string): Promise<string[]> {
    const rows = await this.prisma.collectionItem.findMany({
      where: { collection: { ownerId } },
      distinct: ['placeId'],
      select: { placeId: true },
    })
    return rows.map((r) => r.placeId)
  }

  async findCuratedBySlug(slug: string): Promise<CuratedCollectionView | null> {
    const row = await this.prisma.collection.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        items: {
          orderBy: { sortOrder: 'asc' },
          select: { place: placeCardArgs },
        },
      },
    })
    if (!row || row.slug == null) return null
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description ?? undefined,
      places: row.items.map((it) => toPlaceCardView(it.place)),
    }
  }
}
