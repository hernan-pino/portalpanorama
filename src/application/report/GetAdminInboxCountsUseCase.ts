import { ReportRepository } from '../ports/ReportRepository'
import { SuggestionRepository } from '../ports/SuggestionRepository'
import { BusinessClaimRepository } from '../ports/BusinessClaimRepository'

export interface AdminInboxCounts {
  openReports: number
  openSuggestions: number
  pendingClaims: number
}

// Cuántos reportes/sugerencias siguen OPEN y cuántos reclamos de negocio siguen
// PENDING → badges "nuevo" en la navegación del admin (s27 + s28). Corre en el
// layout del admin: liviano a propósito (tres counts).
export class GetAdminInboxCountsUseCase {
  constructor(
    private readonly reportRepo: ReportRepository,
    private readonly suggestionRepo: SuggestionRepository,
    private readonly claimRepo: BusinessClaimRepository,
  ) {}

  async execute(): Promise<AdminInboxCounts> {
    const [openReports, openSuggestions, pendingClaims] = await Promise.all([
      this.reportRepo.countOpen(),
      this.suggestionRepo.countOpen(),
      this.claimRepo.countPending(),
    ])
    return { openReports, openSuggestions, pendingClaims }
  }
}
