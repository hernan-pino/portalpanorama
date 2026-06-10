import { PlaceFacets, SearchService } from '../ports/SearchService'

// Contadores por faceta (estáticos en MVP). La UI oculta las opciones con count 0.
export class GetPlaceFacetsUseCase {
  constructor(private readonly search: SearchService) {}

  execute(): Promise<PlaceFacets> {
    return this.search.getFacets()
  }
}
