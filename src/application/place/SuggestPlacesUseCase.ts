import { PlaceSuggestion, SearchService } from '../ports/SearchService'

// Autocompletado de la barra de búsqueda. Fino: corta las consultas demasiado
// cortas (1 carácter = ruido) y delega el matching tolerante al SearchService.
export class SuggestPlacesUseCase {
  constructor(private readonly search: SearchService) {}

  execute(query: string, limit = 6): Promise<PlaceSuggestion[]> {
    if (query.trim().length < 2) return Promise.resolve([])
    return this.search.suggest(query, limit)
  }
}
