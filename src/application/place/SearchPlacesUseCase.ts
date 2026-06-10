import { SearchParams, SearchResult, SearchService } from '../ports/SearchService'

// Búsqueda con filtros vivos + orden por reputación (score desc). El use case es
// fino: la lógica de query/orden vive en el adaptador de SearchService.
export class SearchPlacesUseCase {
  constructor(private readonly search: SearchService) {}

  execute(params: SearchParams): Promise<SearchResult> {
    return this.search.search(params)
  }
}
