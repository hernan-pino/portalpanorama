import { $Enums, Prisma, PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import { Place } from '@domain/place/Place'
import { Slug } from '@domain/shared/Slug'
import { TagLayer } from '@domain/catalog/TagLayer'
import { PriceRange } from '@domain/place/PriceRange'
import { ReservationPolicy } from '@domain/place/ReservationPolicy'
import { RainPolicy } from '@domain/place/RainPolicy'
import { PlaceStatus } from '@domain/place/PlaceStatus'
import {
  CategoryRatingStat,
  OwnedPlaceRow,
  OwnerEditableFields,
  OwnerEditablePlaceView,
  OwnerImageInput,
  PlaceAdminRow,
  PlaceCardView,
  PlaceDetailView,
  FeaturedPlaceView,
  PlaceParentOption,
  PlaceRatingRow,
  PlaceRepository,
} from '@application/ports/PlaceRepository'
import { placeCardArgs, toPlaceCardView } from './placeCardView'

// El JSON de socialLinks viene como `Prisma.JsonValue`: lo validamos a [{network,url}]
// y descartamos lo malformado (es informativo; nunca debe tumbar la ficha).
function parseSocialLinks(value: Prisma.JsonValue | null | undefined): { network: string; url: string }[] {
  if (!Array.isArray(value)) return []
  const links: { network: string; url: string }[] = []
  for (const item of value) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const network = (item as Record<string, unknown>).network
      const url = (item as Record<string, unknown>).url
      if (typeof network === 'string' && typeof url === 'string') links.push({ network, url })
    }
  }
  return links
}

// ── Agregado: Place + imágenes + tags (con su capa, para validar invariantes) ──
const aggregateArgs = Prisma.validator<Prisma.PlaceDefaultArgs>()({
  include: {
    images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
    points: { orderBy: { sortOrder: 'asc' } },
    tags: { include: { tag: true } },
  },
})
type PlaceAggregateRow = Prisma.PlaceGetPayload<typeof aggregateArgs>

function toPlaceDomain(row: PlaceAggregateRow): Place {
  return Place.create({
    id: row.id,
    slug: Slug.fromExisting(row.slug),
    name: row.name,
    description: row.description ?? undefined,
    menuUrl: row.menuUrl ?? undefined,
    categoryId: row.categoryId,
    subcategoryId: row.subcategoryId,
    secondaryCategoryId: row.secondaryCategoryId ?? undefined,
    secondarySubcategoryId: row.secondarySubcategoryId ?? undefined,
    address: row.address ?? undefined,
    communeId: row.communeId,
    neighborhoodId: row.neighborhoodId ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    metroStationId: row.metroStationId ?? undefined,
    accessDetail: row.accessDetail ?? undefined,
    reference: row.reference ?? undefined,
    rainPolicy: (row.rainPolicy as RainPolicy | null) ?? undefined,
    priceRange: (row.priceRange as PriceRange | null) ?? undefined,
    reservation: (row.reservation as ReservationPolicy | null) ?? undefined,
    paymentMethods: row.paymentMethods,
    schedule: row.schedule ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    instagram: row.instagram ?? undefined,
    socialLinks: parseSocialLinks(row.socialLinks),
    googlePlaceId: row.googlePlaceId ?? undefined,
    googleRating: row.googleRating ?? undefined,
    googleReviewCount: row.googleReviewCount ?? undefined,
    score: row.score,
    isPremium: row.isPremium,
    ownerId: row.ownerId ?? undefined,
    status: row.status as PlaceStatus,
    parentId: row.parentId ?? undefined,
    brandId: row.brandId ?? undefined,
    images: row.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt ?? undefined,
      credit: img.credit ?? undefined,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    points: row.points.map((pt) => ({
      id: pt.id,
      name: pt.name,
      description: pt.description ?? undefined,
      kind: pt.kind ?? undefined,
      sortOrder: pt.sortOrder,
    })),
    tags: row.tags.map((pt) => ({
      id: pt.tag.id,
      slug: pt.tag.slug,
      name: pt.tag.name,
      layer: pt.tag.layer as TagLayer,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

// Campos escalares del Place para create/update. Optionals → null explícito:
// save() persiste el agregado completo, así que un campo vaciado debe limpiarse.
function toWriteData(place: Place) {
  return {
    slug: place.slug.value,
    name: place.name,
    description: place.description ?? null,
    menuUrl: place.menuUrl ?? null,
    categoryId: place.categoryId,
    subcategoryId: place.subcategoryId,
    secondaryCategoryId: place.secondaryCategoryId ?? null,
    secondarySubcategoryId: place.secondarySubcategoryId ?? null,
    address: place.address ?? null,
    communeId: place.communeId,
    neighborhoodId: place.neighborhoodId ?? null,
    lat: place.lat ?? null,
    lng: place.lng ?? null,
    metroStationId: place.metroStationId ?? null,
    accessDetail: place.accessDetail ?? null,
    reference: place.reference ?? null,
    rainPolicy: (place.rainPolicy as $Enums.RainPolicy | undefined) ?? null,
    priceRange: (place.priceRange as $Enums.PriceRange | undefined) ?? null,
    reservation: (place.reservation as $Enums.ReservationPolicy | undefined) ?? null,
    paymentMethods: [...place.paymentMethods],
    schedule: place.schedule ?? null,
    phone: place.phone ?? null,
    website: place.website ?? null,
    instagram: place.instagram ?? null,
    // Json? : array si hay redes, DB NULL si no (Prisma exige DbNull, no `null`).
    socialLinks: place.socialLinks.length
      ? place.socialLinks.map((s) => ({ network: s.network, url: s.url }))
      : Prisma.DbNull,
    googlePlaceId: place.googlePlaceId ?? null,
    googleRating: place.googleRating ?? null,
    googleReviewCount: place.googleReviewCount ?? null,
    score: place.score,
    isPremium: place.isPremium,
    ownerId: place.ownerId ?? null,
    status: place.status as $Enums.PlaceStatus,
    parentId: place.parentId ?? null,
    brandId: place.brandId ?? null,
    updatedAt: place.updatedAt,
  }
}

// ── Detalle denormalizado para la ficha (read-model) ──
const detailArgs = Prisma.validator<Prisma.PlaceDefaultArgs>()({
  include: {
    category: { select: { slug: true, name: true } },
    subcategory: { select: { slug: true, name: true } },
    secondaryCategory: { select: { slug: true, name: true } },
    commune: { select: { slug: true, name: true } },
    neighborhood: { select: { slug: true, name: true } },
    metroStation: {
      select: { slug: true, name: true, lines: { select: { code: true, color: true } } },
    },
    images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
    tags: { include: { tag: { select: { slug: true, name: true, layer: true } } } },
    // Contenedor: el padre (para el badge del hijo) y los hijos-con-ficha
    // publicados (tarjetas en la ficha del padre). Un solo nivel en pantalla.
    parent: { select: { slug: true, name: true, status: true } },
    children: {
      where: { status: $Enums.PlaceStatus.PUBLISHED },
      orderBy: { score: 'desc' },
      select: placeCardArgs.select,
    },
    points: { orderBy: { sortOrder: 'asc' } },
    // Marca de la sucursal (bloque "Por [Marca]"): solo lo que pinta la ficha.
    brand: { select: { slug: true, name: true, logoUrl: true } },
  },
})
type PlaceDetailRow = Prisma.PlaceGetPayload<typeof detailArgs>

function toPlaceDetailView(row: PlaceDetailRow): PlaceDetailView {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    menuUrl: row.menuUrl ?? undefined,
    category: row.category,
    subcategory: row.subcategory,
    secondaryCategory: row.secondaryCategory ?? undefined,
    address: row.address ?? undefined,
    commune: row.commune,
    neighborhood: row.neighborhood ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    metroStation: row.metroStation
      ? { slug: row.metroStation.slug, name: row.metroStation.name, lines: row.metroStation.lines }
      : undefined,
    accessDetail: row.accessDetail ?? undefined,
    reference: row.reference ?? undefined,
    rainPolicy: row.rainPolicy ?? undefined,
    priceRange: row.priceRange ?? undefined,
    reservation: row.reservation ?? undefined,
    paymentMethods: row.paymentMethods,
    schedule: row.schedule ?? undefined,
    phone: row.phone ?? undefined,
    website: row.website ?? undefined,
    instagram: row.instagram ?? undefined,
    socialLinks: parseSocialLinks(row.socialLinks),
    googleRating: row.googleRating ?? undefined,
    googleReviewCount: row.googleReviewCount ?? undefined,
    googlePlaceId: row.googlePlaceId ?? undefined,
    score: row.score,
    images: row.images.map((img) => ({
      url: img.url,
      alt: img.alt ?? undefined,
      credit: img.credit ?? undefined,
      isPrimary: img.isPrimary,
    })),
    tags: row.tags.map((pt) => ({ slug: pt.tag.slug, name: pt.tag.name, layer: pt.tag.layer })),
    // Badge del hijo solo si el padre está publicado (su ficha es navegable).
    parent:
      row.parent && row.parent.status === $Enums.PlaceStatus.PUBLISHED
        ? { slug: row.parent.slug, name: row.parent.name }
        : undefined,
    children: row.children.map(toPlaceCardView),
    points: row.points.map((pt) => ({
      name: pt.name,
      description: pt.description ?? undefined,
      kind: pt.kind ?? undefined,
    })),
    brand: row.brand
      ? { slug: row.brand.slug, name: row.brand.name, logoUrl: row.brand.logoUrl ?? undefined }
      : undefined,
  }
}

const RELATED_POOL = 50 // candidatos a rankear en memoria por similitud

export class PrismaPlaceRepository implements PlaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Place | null> {
    const row = await this.prisma.place.findUnique({ where: { id }, ...aggregateArgs })
    return row ? toPlaceDomain(row) : null
  }

  async findBySlug(slug: string): Promise<Place | null> {
    const row = await this.prisma.place.findUnique({ where: { slug }, ...aggregateArgs })
    return row ? toPlaceDomain(row) : null
  }

  // Upsert del encabezado + reemplazo total de imágenes y tags (el Place es el
  // agregado dueño de ambos). En transacción para no dejar estados a medias.
  async save(place: Place): Promise<void> {
    const data = toWriteData(place)
    await this.prisma.$transaction([
      this.prisma.place.upsert({
        where: { id: place.id },
        create: { id: place.id, createdAt: place.createdAt, ...data },
        update: data,
      }),
      this.prisma.placeImage.deleteMany({ where: { placeId: place.id } }),
      this.prisma.placeImage.createMany({
        data: place.images.map((img) => ({
          id: img.id,
          placeId: place.id,
          url: img.url,
          alt: img.alt ?? null,
          credit: img.credit ?? null,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
      }),
      this.prisma.placePoint.deleteMany({ where: { placeId: place.id } }),
      this.prisma.placePoint.createMany({
        data: place.points.map((pt) => ({
          id: pt.id,
          placeId: place.id,
          name: pt.name,
          description: pt.description ?? null,
          kind: pt.kind ?? null,
          sortOrder: pt.sortOrder,
        })),
      }),
      this.prisma.placeTag.deleteMany({ where: { placeId: place.id } }),
      this.prisma.placeTag.createMany({
        data: place.tags.map((t) => ({ placeId: place.id, tagId: t.id })),
      }),
    ])
  }

  // Borrado duro. Cascade/SetNull en el schema limpian las relaciones; no hace
  // falta tocar las tablas hijas a mano.
  async delete(id: string): Promise<void> {
    await this.prisma.place.delete({ where: { id } })
  }

  // Read-model PÚBLICO: solo lugares publicados. Un PENDING_REVIEW/ARCHIVED por
  // URL directa debe dar 404 (explorar ya los filtra; esto cierra la otra puerta).
  async getDetailBySlug(slug: string): Promise<PlaceDetailView | null> {
    const row = await this.prisma.place.findFirst({
      where: { slug, status: $Enums.PlaceStatus.PUBLISHED },
      ...detailArgs,
    })
    return row ? toPlaceDetailView(row) : null
  }

  // Sitemap: solo publicados (lo mismo que ve el público), con su fecha de edición
  // para `lastModified`. Lo más reciente arriba.
  async listPublishedForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.prisma.place.findMany({
      where: { status: $Enums.PlaceStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })
  }

  // Tabla del admin: todos los estados, lo más editado arriba. Denormaliza nombre
  // de categoría/comuna para no resolverlos en presentation.
  async listForAdmin(): Promise<PlaceAdminRow[]> {
    const rows = await this.prisma.place.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        score: true,
        googleRating: true,
        updatedAt: true,
        category: { select: { name: true } },
        commune: { select: { name: true } },
        _count: { select: { visitHistory: true, collectionItems: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      status: r.status,
      categoryName: r.category.name,
      communeName: r.commune.name,
      googleRating: r.googleRating ?? undefined,
      score: r.score,
      updatedAt: r.updatedAt,
      visitCount: r._count.visitHistory,
      saveCount: r._count.collectionItems,
    }))
  }

  // Opciones de "lugar padre" para el form: todos los lugares, ordenados por nombre.
  // El form excluye el propio lugar (edición); el use case rechaza ciclos.
  async listForParentOptions(): Promise<PlaceParentOption[]> {
    return this.prisma.place.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }

  // Conteo por subcategoría primaria (vista de cobertura): total no-archivado +
  // publicados. groupBy por subcategoría y estado; se agrega en memoria.
  async coverageBySubcategory(): Promise<
    { subcategoryId: string; total: number; published: number }[]
  > {
    const rows = await this.prisma.place.groupBy({
      by: ['subcategoryId', 'status'],
      _count: { _all: true },
    })
    const map = new Map<string, { total: number; published: number }>()
    for (const r of rows) {
      const entry = map.get(r.subcategoryId) ?? { total: 0, published: 0 }
      if (r.status !== $Enums.PlaceStatus.ARCHIVED) entry.total += r._count._all
      if (r.status === $Enums.PlaceStatus.PUBLISHED) entry.published += r._count._all
      map.set(r.subcategoryId, entry)
    }
    return [...map].map(([subcategoryId, c]) => ({ subcategoryId, ...c }))
  }

  // Cadena de ancestros (padre, abuelo, …) recorriendo parentId hacia arriba. Tope
  // defensivo por si quedara un ciclo en datos (no debería: el dominio lo impide).
  async findAncestorIds(placeId: string): Promise<string[]> {
    const ancestors: string[] = []
    let currentId: string | null = placeId
    const MAX_DEPTH = 50
    for (let i = 0; i < MAX_DEPTH && currentId; i++) {
      const row: { parentId: string | null } | null = await this.prisma.place.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      })
      const nextParentId: string | null = row?.parentId ?? null
      if (!nextParentId || ancestors.includes(nextParentId)) break
      ancestors.push(nextParentId)
      currentId = nextParentId
    }
    return ancestors
  }

  // "Relacionados" sin IA (D.6): similitud por categoría + comuna + tags compartidos.
  // Se trae un pool de candidatos publicados que comparten algo y se rankea en
  // memoria (+3 misma categoría, +2 misma comuna, +1 por tag compartido).
  async findRelated(placeId: string, limit: number): Promise<PlaceCardView[]> {
    const base = await this.prisma.place.findUnique({
      where: { id: placeId },
      select: { categoryId: true, communeId: true, tags: { select: { tagId: true } } },
    })
    if (!base) return []
    const baseTagIds = new Set(base.tags.map((t) => t.tagId))

    const candidates = await this.prisma.place.findMany({
      where: {
        id: { not: placeId },
        status: $Enums.PlaceStatus.PUBLISHED,
        OR: [
          { categoryId: base.categoryId },
          { communeId: base.communeId },
          { tags: { some: { tagId: { in: [...baseTagIds] } } } },
        ],
      },
      orderBy: { score: 'desc' },
      take: RELATED_POOL,
      select: { ...placeCardArgs.select, categoryId: true, communeId: true, tags: { select: { tagId: true } } },
    })

    const ranked = candidates
      .map((c) => {
        let affinity = 0
        if (c.categoryId === base.categoryId) affinity += 3
        if (c.communeId === base.communeId) affinity += 2
        affinity += c.tags.filter((t) => baseTagIds.has(t.tagId)).length
        return { card: toPlaceCardView(c), affinity, score: c.score }
      })
      .sort((a, b) => b.affinity - a.affinity || b.score - a.score)

    return ranked.slice(0, limit).map((r) => r.card)
  }

  async findCardsByIds(ids: string[]): Promise<FeaturedPlaceView[]> {
    if (ids.length === 0) return []
    const rows = await this.prisma.place.findMany({
      where: { id: { in: ids }, status: $Enums.PlaceStatus.PUBLISHED },
      select: { ...placeCardArgs.select, schedule: true },
    })
    return rows.map((row) => ({ ...toPlaceCardView(row), schedule: row.schedule ?? undefined }))
  }

  // C del bayesiano: promedio de la nota de Google en todo el catálogo con rating.
  async globalAverageRating(): Promise<number> {
    const agg = await this.prisma.place.aggregate({
      _avg: { googleRating: true },
      where: { googleRating: { not: null } },
    })
    return agg._avg.googleRating ?? 0
  }

  // Promedio + muestra por categoría (prior C por categoría). Misma población que
  // el promedio global: todo lugar con rating, sin filtrar por estado.
  async categoryRatingStats(): Promise<CategoryRatingStat[]> {
    const rows = await this.prisma.place.groupBy({
      by: ['categoryId'],
      where: { googleRating: { not: null } },
      _avg: { googleRating: true },
      _count: { googleRating: true },
    })
    return rows.map((r) => ({
      categoryId: r.categoryId,
      average: r._avg.googleRating ?? 0,
      ratedCount: r._count.googleRating,
    }))
  }

  async findRatingsForScoring(): Promise<PlaceRatingRow[]> {
    return this.prisma.place.findMany({
      select: { id: true, categoryId: true, googleRating: true, googleReviewCount: true },
    })
  }

  // Un solo UPDATE con unnest: cientos de updates individuales en transacción
  // exceden el timeout de Prisma contra Neon (y la atomicidad no importa acá —
  // el batch es idempotente y re-corrible).
  async updateScores(scores: { id: string; score: number }[]): Promise<void> {
    if (scores.length === 0) return
    const ids = scores.map((s) => s.id)
    const values = scores.map((s) => s.score)
    await this.prisma.$executeRaw`
      UPDATE "Place" AS p
      SET "score" = s.score
      FROM (SELECT unnest(${ids}::text[]) AS id, unnest(${values}::float8[]) AS score) AS s
      WHERE p."id" = s.id
    `
  }

  // ── Panel de negocio (dueño verificado) ──
  async countManagedByUser(userId: string): Promise<number> {
    return this.prisma.place.count({
      where: { OR: [{ ownerId: userId }, { brand: { ownerId: userId } }] },
    })
  }

  // Fichas que gestiona el usuario: propias (ownerId) O de una marca suya (brand.ownerId).
  async findManagedByUser(userId: string): Promise<OwnedPlaceRow[]> {
    const rows = await this.prisma.place.findMany({
      where: { OR: [{ ownerId: userId }, { brand: { ownerId: userId } }] },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        googleRating: true,
        description: true,
        schedule: true,
        phone: true,
        website: true,
        instagram: true,
        menuUrl: true,
        priceRange: true,
        category: { select: { name: true } },
        commune: { select: { name: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true },
        },
        _count: { select: { visitHistory: true, collectionItems: true, images: true } },
      },
    })
    const filled = (v: string | null | undefined) => !!v && v.trim().length > 0
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      status: r.status,
      categoryName: r.category.name,
      communeName: r.commune.name,
      coverUrl: r.images[0]?.url,
      googleRating: r.googleRating ?? undefined,
      visitCount: r._count.visitHistory,
      saveCount: r._count.collectionItems,
      imageCount: r._count.images,
      hasDescription: filled(r.description),
      hasSchedule: filled(r.schedule),
      hasPhone: filled(r.phone),
      hasWebsite: filled(r.website),
      hasInstagram: filled(r.instagram),
      hasMenu: filled(r.menuUrl),
      hasPrice: r.priceRange != null,
    }))
  }

  async findOwnerEditableBySlug(slug: string): Promise<OwnerEditablePlaceView | null> {
    const r = await this.prisma.place.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        schedule: true,
        phone: true,
        website: true,
        instagram: true,
        menuUrl: true,
        priceRange: true,
        reservation: true,
        accessDetail: true,
        reference: true,
        socialLinks: true,
        ownerId: true,
        category: { select: { name: true } },
        commune: { select: { name: true } },
        brand: { select: { ownerId: true } },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
          select: { url: true, alt: true, isPrimary: true },
        },
      },
    })
    if (!r) return null
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      categoryName: r.category.name,
      communeName: r.commune.name,
      description: r.description ?? undefined,
      schedule: r.schedule ?? undefined,
      phone: r.phone ?? undefined,
      website: r.website ?? undefined,
      instagram: r.instagram ?? undefined,
      menuUrl: r.menuUrl ?? undefined,
      priceRange: (r.priceRange as PriceRange | null) ?? undefined,
      reservation: (r.reservation as ReservationPolicy | null) ?? undefined,
      accessDetail: r.accessDetail ?? undefined,
      reference: r.reference ?? undefined,
      ownerId: r.ownerId,
      brandOwnerId: r.brand?.ownerId ?? null,
      images: r.images.map((img) => ({
        url: img.url,
        alt: img.alt ?? undefined,
        isPrimary: img.isPrimary,
      })),
      socialLinks: parseSocialLinks(r.socialLinks),
    }
  }

  // Solo los campos operacionales editables por el dueño. NO toca nombre/categoría/
  // ubicación/rating/score/estado/tags/ownerId. El score no depende de estos campos.
  async updateOwnerEditableFields(placeId: string, fields: OwnerEditableFields): Promise<void> {
    const data: Prisma.PlaceUpdateInput = {
      description: fields.description ?? null,
      schedule: fields.schedule ?? null,
      phone: fields.phone ?? null,
      website: fields.website ?? null,
      instagram: fields.instagram ?? null,
      menuUrl: fields.menuUrl ?? null,
      priceRange: (fields.priceRange as $Enums.PriceRange | undefined) ?? null,
      reservation: (fields.reservation as $Enums.ReservationPolicy | undefined) ?? null,
      accessDetail: fields.accessDetail ?? null,
      reference: fields.reference ?? null,
    }
    // socialLinks solo se toca si el caller lo mandó explícito (undefined = no tocar,
    // así un save parcial nunca borra las redes existentes). El form manda el set completo.
    if (fields.socialLinks !== undefined) {
      data.socialLinks = fields.socialLinks.length ? fields.socialLinks : Prisma.DbNull
    }
    await this.prisma.place.update({ where: { id: placeId }, data })
  }

  // Reemplazo total del set de fotos (delete + recreate), acotado a las imágenes.
  // En transacción para no dejar la ficha sin fotos si algo falla a mitad. El
  // sortOrder = índice del arreglo (el orden que dejó el dueño). Garantiza a lo
  // más una portada: si ninguna viene marcada, la primera queda de portada.
  async updateOwnerImages(placeId: string, images: OwnerImageInput[]): Promise<void> {
    const hasPrimary = images.some((img) => img.isPrimary)
    await this.prisma.$transaction([
      this.prisma.placeImage.deleteMany({ where: { placeId } }),
      this.prisma.placeImage.createMany({
        data: images.map((img, i) => ({
          id: createId(),
          placeId,
          url: img.url,
          alt: img.alt ?? null,
          isPrimary: img.isPrimary || (!hasPrimary && i === 0),
          sortOrder: i,
        })),
      }),
    ])
  }
}
