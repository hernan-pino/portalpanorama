import { CategoryRepository } from '../ports/CategoryRepository'
import { PlaceRepository } from '../ports/PlaceRepository'

export interface SubcategoryCoverage {
  name: string
  total: number
  published: number
}
export interface CategoryCoverage {
  name: string
  total: number
  subcategories: SubcategoryCoverage[]
}

// Cobertura del catálogo: por cada categoría asignable y su subcategoría, cuántos
// lugares hay cargados (total no-archivado) y cuántos publicados. Sirve para ver de
// un vistazo dónde falta contenido al cargar a mano.
export class GetCatalogCoverageUseCase {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly placeRepo: PlaceRepository,
  ) {}

  async execute(): Promise<CategoryCoverage[]> {
    const [categories, counts] = await Promise.all([
      this.categoryRepo.listForForm(),
      this.placeRepo.coverageBySubcategory(),
    ])
    const byId = new Map(counts.map((c) => [c.subcategoryId, c]))

    return categories.map((cat) => {
      const subcategories = cat.subcategories.map((s) => ({
        name: s.name,
        total: byId.get(s.id)?.total ?? 0,
        published: byId.get(s.id)?.published ?? 0,
      }))
      return {
        name: cat.name,
        total: subcategories.reduce((sum, s) => sum + s.total, 0),
        subcategories,
      }
    })
  }
}
