import { NewSuggestion, SuggestionRepository } from '@application/ports/SuggestionRepository'

// "Sugerencias" del público (footer). Anónimo-friendly: el email/userId son opcionales.
// La validación de forma (largo del mensaje, etc.) va en presentation (Zod).
export class CreateSuggestionUseCase {
  constructor(private readonly suggestionRepo: SuggestionRepository) {}

  execute(input: NewSuggestion): Promise<void> {
    return this.suggestionRepo.create(input)
  }
}
