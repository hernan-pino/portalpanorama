import { ReportRepository } from '../ports/ReportRepository'
import { SuggestionRepository } from '../ports/SuggestionRepository'

export interface AdminInboxCounts {
  openReports: number
  openSuggestions: number
}

// Cuántos reportes/sugerencias siguen OPEN (sin atender) → badge "nuevo" en la
// pestaña Reportes del admin (sesión 27). Corre en el layout del admin: liviano
// a propósito (dos counts).
export class GetAdminInboxCountsUseCase {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly suggestionRepo: SuggestionRepository,
  ) {}

  async execute(): Promise<AdminInboxCounts> {
    const [openReports, openSuggestions] = await Promise.all([
      this.reportRepo.countOpen(),
      this.suggestionRepo.countOpen(),
    ])
    return { openReports, openSuggestions }
  }
}
