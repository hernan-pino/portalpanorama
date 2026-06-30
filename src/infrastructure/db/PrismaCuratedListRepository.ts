import { $Enums, Prisma, PrismaClient } from '@prisma/client'
import { CuratedList, CuratedListKind } from '@domain/curatedList/CuratedList'
import { CuratedRule } from '@domain/curatedList/CuratedRule'
import { PriceRange } from '@domain/place/PriceRange'
import { Slug } from '@domain/shared/Slug'
import {
  CuratedListAdminRow,
  CuratedListCardView,
  CuratedListRepository,
} from '@application/ports/CuratedListRepository'

// La regla viaja como Json en BD. La parseamos defensivamente a CuratedRule:
// campos desconocidos/malformados se descartan (nunca debe tumbar la lectura).
function parseRule(value: Prisma.JsonValue | null | undefined): CuratedRule {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const r = value as Record<string, unknown>
  const str = (v: unknown): string | undefined => (typeof v === 'string' ? v : undefined)
  const strArr = (v: unknown): string[] | undefined =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined
  const priceArr = (v: unknown): PriceRange[] | undefined =>
    Array.isArray(v)
      ? v.filter((x): x is PriceRange =>
          typeof x === 'string' && x in $Enums.PriceRange,
        )
      : undefined
  return {
    categorySlug: str(r.categorySlug),
    subcategorySlug: str(r.subcategorySlug),
    communeSlug: str(r.communeSlug),
    neighborhoodSlug: str(r.neighborhoodSlug),
    metroLineCode: str(r.metroLineCode),
    metroStationSlug: str(r.metroStationSlug),
    priceRanges: priceArr(r.priceRanges),
    socialTagSlugs: strArr(r.socialTagSlugs),
    accessTagSlugs: strArr(r.accessTagSlugs),
    vibeTagSlugs: strArr(r.vibeTagSlugs),
    occasionTagSlugs: strArr(r.occasionTagSlugs),
    experienceTagSlugs: strArr(r.experienceTagSlugs),
    walkInOnly: typeof r.walkInOnly === 'boolean' ? r.walkInOnly : undefined,
  }
}

// Serializa la regla a JSON plano, omitiendo los campos vacíos (storage limpio).
function ruleToJson(rule: CuratedRule): Prisma.InputJsonValue {
  const out: Record<string, Prisma.InputJsonValue> = {}
  for (const [k, v] of Object.entries(rule)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v) && v.length === 0) continue
    // Los valores de la regla son siempre JSON-safe (string | string[] | PriceRange[] | boolean).
    out[k] = v as Prisma.InputJsonValue
  }
  return out
}

type CuratedListRow = {
  id: string
  slug: string
  name: string
  kind: $Enums.CuratedListKind
  description: string | null
  intro: string | null
  coverImageUrl: string | null
  rule: Prisma.JsonValue
  sort: string
  isPublished: boolean
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  pins: { placeId: string; kind: $Enums.CuratedPinKind; blurb: string | null; sortOrder: number }[]
}

function toDomain(row: CuratedListRow): CuratedList {
  return CuratedList.create({
    id: row.id,
    slug: Slug.fromExisting(row.slug),
    name: row.name,
    kind: row.kind as CuratedListKind,
    description: row.description ?? undefined,
    intro: row.intro ?? undefined,
    coverImageUrl: row.coverImageUrl ?? undefined,
    rule: parseRule(row.rule),
    sort: 'score_desc',
    isPublished: row.isPublished,
    publishedAt: row.publishedAt ?? undefined,
    pins: row.pins.map((p) => ({
      placeId: p.placeId,
      kind: p.kind as 'FEATURED' | 'MENTION',
      blurb: p.blurb ?? undefined,
      sortOrder: p.sortOrder,
    })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

const withPins = { pins: true } as const

export class PrismaCuratedListRepository implements CuratedListRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<CuratedList | null> {
    const row = await this.prisma.curatedList.findUnique({
      where: { id },
      include: withPins,
    })
    return row ? toDomain(row) : null
  }

  async findBySlug(slug: string): Promise<CuratedList | null> {
    const row = await this.prisma.curatedList.findUnique({
      where: { slug },
      include: withPins,
    })
    return row ? toDomain(row) : null
  }

  // Upsert de la lista + reemplazo completo de sus destacados, atómico: los pins
  // son contenido de la lista (no entidades sueltas), así que se rehacen enteros.
  async save(list: CuratedList): Promise<void> {
    const data = {
      slug: list.slug.value,
      name: list.name,
      kind: list.kind as $Enums.CuratedListKind,
      description: list.description ?? null,
      intro: list.intro ?? null,
      coverImageUrl: list.coverImageUrl ?? null,
      rule: ruleToJson(list.rule),
      sort: list.sort,
      isPublished: list.isPublished,
      publishedAt: list.publishedAt ?? null,
      updatedAt: list.updatedAt,
    }
    const pins = list.pins.map((p) => ({
      placeId: p.placeId,
      kind: p.kind as $Enums.CuratedPinKind,
      blurb: p.blurb ?? null,
      sortOrder: p.sortOrder,
    }))

    await this.prisma.$transaction([
      this.prisma.curatedList.upsert({
        where: { id: list.id },
        create: { id: list.id, createdAt: list.createdAt, ...data },
        update: data,
      }),
      this.prisma.curatedListPin.deleteMany({ where: { listId: list.id } }),
      this.prisma.curatedListPin.createMany({
        data: pins.map((p) => ({ listId: list.id, ...p })),
      }),
    ])
  }

  async delete(id: string): Promise<void> {
    await this.prisma.curatedList.delete({ where: { id } })
  }

  async listForAdmin(): Promise<CuratedListAdminRow[]> {
    const rows = await this.prisma.curatedList.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        kind: true,
        isPublished: true,
        updatedAt: true,
        _count: { select: { pins: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      kind: r.kind as CuratedListKind,
      isPublished: r.isPublished,
      pinCount: r._count.pins,
      updatedAt: r.updatedAt,
    }))
  }

  async listPublished(): Promise<CuratedListCardView[]> {
    const rows = await this.prisma.curatedList.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      select: {
        slug: true,
        name: true,
        kind: true,
        description: true,
        coverImageUrl: true,
      },
    })
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      kind: r.kind as CuratedListKind,
      description: r.description ?? undefined,
      coverImageUrl: r.coverImageUrl ?? undefined,
    }))
  }

  async listPublishedForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.prisma.curatedList.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    })
  }
}
