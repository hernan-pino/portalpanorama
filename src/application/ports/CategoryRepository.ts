// Catálogo de categorías para la home y los filtros. Solo lectura: el catálogo
// se siembra por seed. En el MVP solo se muestran las categorías con lugares
// (isActive && !eventOnly); las event-only quedan registradas pero apagadas.

export interface SubcategoryView {
  slug: string
  name: string
}

export interface CategoryView {
  slug: string
  name: string
  sortOrder: number
  subcategories: SubcategoryView[]
}

export interface CategoryRepository {
  // Categorías activas y no event-only, ordenadas por sortOrder.
  findActive(): Promise<CategoryView[]>
}
