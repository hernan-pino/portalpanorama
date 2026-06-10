import { PrismaClient } from '@prisma/client'
import { PlaceTagRef } from '@domain/place/Place'
import { TagLayer } from '@domain/catalog/TagLayer'
import { TagRepository } from '@application/ports/TagRepository'

export class PrismaTagRepository implements TagRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Resuelve tags por id con su capa para que el dominio valide los límites
  // (SOCIAL ≤ 4, VIBE ≤ 3) al construir el Place. Solo lectura: el catálogo se siembra.
  async findByIds(ids: string[]): Promise<PlaceTagRef[]> {
    if (ids.length === 0) return []
    const rows = await this.prisma.tag.findMany({ where: { id: { in: ids } } })
    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      layer: r.layer as TagLayer,
    }))
  }
}
