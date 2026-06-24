import { SuggestionRepository } from '@application/ports/SuggestionRepository'
import { SuggestionStatus } from '@domain/suggestion/SuggestionStatus'

// Admin marca una sugerencia como resuelta / reabierta.
export class SetSuggestionStatusUseCase {
  constructor(private readonly suggestionRepo: SuggestionRepository) {}

  execute(suggestionId: string, status: SuggestionStatus): Promise<void> {
    return this.suggestionRepo.setStatus(suggestionId, status)
  }
}
