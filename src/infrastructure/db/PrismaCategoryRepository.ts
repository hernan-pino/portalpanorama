import { PrismaClient } from '@prisma/client'
import { CategoryRepository, CategoryView } from '@application/listing/GetCategoriesUseCase'

export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<CategoryView[]> {
    const rows = await this.prisma.category.findMany({ orderBy: { name: 'asc' } })
    return rows.map((r) => ({ id: r.id, slug: r.slug, name: r.name }))
  }
}
