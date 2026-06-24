import { SuggestionRepository } from '@application/ports/SuggestionRepository'

// Borrado duro de una sugerencia (típicamente spam).
export class DeleteSuggestionUseCase {
  constructor(private readonly suggestionRepo: SuggestionRepository) {}

  execute(suggestionId: string): Promise<void> {
    return this.suggestionRepo.delete(suggestionId)
  }
}
