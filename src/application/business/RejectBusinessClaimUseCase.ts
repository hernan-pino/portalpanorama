import { ClaimNotFoundError } from '@domain/business/errors/ClaimNotFoundError'
import { BusinessClaimRepository } from '../ports/BusinessClaimRepository'
import { EmailService } from '../ports/EmailService'

// El admin rechaza un reclamo, idealmente con motivo: el motivo viaja en el correo
// al reclamante (decisión s28: la revisión nunca es un hoyo negro).
export class RejectBusinessClaimUseCase {
  constructor(
    private readonly claimRepo: BusinessClaimRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(claimId: string, reviewerId: string, notes?: string): Promise<void> {
    const claim = await this.claimRepo.findById(claimId)
    if (!claim) throw new ClaimNotFoundError(claimId)

    const rejected = claim.reject(reviewerId, notes)
    await this.claimRepo.persistRejection(rejected)

    const ctx = await this.claimRepo.notificationContext(claimId)
    if (!ctx) return
    try {
      await this.emailService.sendClaimRejected(ctx.claimantEmail, ctx.claimantName, ctx.targetName, notes)
    } catch (err) {
      console.error('Reclamo rechazado pero falló el correo de aviso:', err)
    }
  }
}
