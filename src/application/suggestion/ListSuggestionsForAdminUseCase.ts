import { SuggestionAdminRow, SuggestionRepository } from '@application/ports/SuggestionRepository'

// Buzón de admin: lista todas las sugerencias del público, recientes primero.
export class ListSuggestionsForAdminUseCase {
  constructor(private readonly suggestionRepo: SuggestionRepository) {}

  execute(): Promise<SuggestionAdminRow[]> {
    return this.suggestionRepo.listForAdmin()
  }
}
