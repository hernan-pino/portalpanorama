import { PlaceTagRef } from '@domain/place/Place'
import { TagLayer } from '@domain/catalog/TagLayer'

// Opción de tag para el selector del form de admin. Lleva la capa (para agrupar:
// social / específico / acceso / ambiente) y la categoría condicional si aplica
// (ej. "tipo de cocina" solo se ofrece cuando la categoría es Gastronomía).
export interface TagOption {
  id: string
  slug: string
  name: string
  layer: TagLayer
  categoryId?: string
}

// Resuelve tags por id (con su capa) para que el dominio pueda validar los
// límites por capa al construir un Place. Solo lectura: el catálogo se siembra.
export interface TagRepository {
  findByIds(ids: string[]): Promise<PlaceTagRef[]>
  // Catálogo completo de tags para el form del admin.
  listAll(): Promise<TagOption[]>
}
