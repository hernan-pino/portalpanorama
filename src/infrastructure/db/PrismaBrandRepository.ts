import { $Enums, Prisma, PrismaClient } from '@prisma/client'
import { Brand } from '@domain/brand/Brand'
import { Slug } from '@domain/shared/Slug'
import {
  BrandAdminRow,
  BrandOption,
  BrandPageView,
  BrandRepository,
} from '@application/ports/BrandRepository'
import { placeCardArgs, toPlaceCardView } from './placeCardView'

// El JSON de socialLinks viene como `Prisma.JsonValue`: lo validamos a [{network,url}]
// y descartamos lo malformado (es informativo; nunca debe tumbar la página).
function parseSocialLinks(
  value: Prisma.JsonValue | null | undefined,
): { network: string; url: string }[] {
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

function toBrandDomain(row: {
  id: string
  slug: string
  name: string
  logoUrl: string | null
  description: string | null
  website: string | null
  instagram: string | null
  socialLinks: Prisma.JsonValue | null
  createdAt: Date
  updatedAt: Date
}): Brand {
  return Brand.create({
    id: row.id,
    slug: Slug.fromExisting(row.slug),
    name: row.name,
    logoUrl: row.logoUrl ?? undefined,
    description: row.description ?? undefined,
    website: row.website ?? undefined,
    instagram: row.instagram ?? undefined,
    socialLinks: parseSocialLinks(row.socialLinks),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

function toWriteData(brand: Brand) {
  return {
    slug: brand.slug.value,
    name: brand.name,
    logoUrl: brand.logoUrl ?? null,
    description: brand.description ?? null,
    website: brand.website ?? null,
    instagram: brand.instagram ?? null,
    socialLinks: brand.socialLinks.length
      ? brand.socialLinks.map((s) => ({ network: s.network, url: s.url }))
      : Prisma.DbNull,
    updatedAt: brand.updatedAt,
  }
}

export class PrismaBrandRepository implements BrandRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Brand | null> {
    const row = await this.prisma.brand.findUnique({ where: { id } })
    return row ? toBrandDomain(row) : null
  }

  async save(brand: Brand): Promise<void> {
    const data = toWriteData(brand)
    await this.prisma.brand.upsert({
      where: { id: brand.id },
      create: { id: brand.id, createdAt: brand.createdAt, ...data },
      update: data,
    })
  }

  // Página pública: la marca + sus sucursales PUBLISHED (las demás no se muestran),
  // ordenadas por score. Null si la marca no existe.
  async getPageBySlug(slug: string): Promise<BrandPageView | null> {
    const row = await this.prisma.brand.findUnique({
      where: { slug },
      include: {
        places: {
          where: { status: $Enums.PlaceStatus.PUBLISHED },
          orderBy: { score: 'desc' },
          select: placeCardArgs.select,
        },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      logoUrl: row.logoUrl ?? undefined,
      description: row.description ?? undefined,
      website: row.website ?? undefined,
      instagram: row.instagram ?? undefined,
      socialLinks: parseSocialLinks(row.socialLinks),
      places: row.places.map(toPlaceCardView),
    }
  }

  // Tabla del admin: todas las marcas, lo más editado arriba, con conteo de locales.
  async listForAdmin(): Promise<BrandAdminRow[]> {
    const rows = await this.prisma.brand.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        logoUrl: true,
        updatedAt: true,
        _count: { select: { places: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      logoUrl: r.logoUrl ?? undefined,
      placeCount: r._count.places,
      updatedAt: r.updatedAt,
    }))
  }

  // Selector "Marca" del form de Place: id + nombre, orden alfabético.
  async listForOptions(): Promise<BrandOption[]> {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    })
  }
}
