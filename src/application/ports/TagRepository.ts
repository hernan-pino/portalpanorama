import { PlaceTagRef } from '@domain/place/Place'

// Resuelve tags por id (con su capa) para que el dominio pueda validar los
// límites por capa al construir un Place. Solo lectura: el catálogo se siembra.
export interface TagRepository {
  findByIds(ids: string[]): Promise<PlaceTagRef[]>
}
