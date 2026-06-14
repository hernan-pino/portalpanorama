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

// Opción de categoría para el form de admin: lleva ids (las FK del Place se
// guardan por id, no por slug) y sus subcategorías también con id. El slug
// permite condicionar campos del form por categoría (ej. menú solo en Gastronomía)
// sin amarrarse al nombre visible.
export interface CategoryOption {
  id: string
  slug: string
  name: string
  subcategories: { id: string; name: string }[]
}

export interface CategoryRepository {
  // Categorías activas y no event-only, ordenadas por sortOrder.
  findActive(): Promise<CategoryView[]>
  // Categorías asignables a un lugar (activas, no event-only) con ids, para los
  // selectores del form de admin.
  listForForm(): Promise<CategoryOption[]>
}
