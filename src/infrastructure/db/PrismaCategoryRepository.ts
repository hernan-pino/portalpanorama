import { PrismaClient } from '@prisma/client'
import { CategoryRepository, CategoryView } from '@application/ports/CategoryRepository'

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Categorías activas y no event-only, ordenadas por sortOrder. Las event-only
  // (Shows/Ferias/Talleres) quedan registradas pero apagadas hasta encender eventos.
  async findActive(): Promise<CategoryView[]> {
    const rows = await this.prisma.category.findMany({
      where: { isActive: true, eventOnly: false },
      orderBy: { sortOrder: 'asc' },
      include: { subcategories: { orderBy: { name: 'asc' } } },
    })
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      sortOrder: r.sortOrder,
      subcategories: r.subcategories.map((s) => ({ slug: s.slug, name: s.name })),
    }))
  }
}
