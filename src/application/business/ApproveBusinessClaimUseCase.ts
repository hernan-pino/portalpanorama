import { ClaimNotFoundError } from '@domain/business/errors/ClaimNotFoundError'
import { BusinessClaimRepository } from '../ports/BusinessClaimRepository'
import { EmailService } from '../ports/EmailService'

// El admin aprueba un reclamo: la transición la valida el dominio; la persistencia
// (reclamo + ownerId del objetivo + BusinessProfile verificado) es una transacción
// del repositorio. Después se le avisa al reclamante por correo.
export class ApproveBusinessClaimUseCase {
  constructor(
    private readonly claimRepo: BusinessClaimRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(claimId: string, reviewerId: string, notes?: string): Promise<void> {
    const claim = await this.claimRepo.findById(claimId)
    if (!claim) throw new ClaimNotFoundError(claimId)

    const approved = claim.approve(reviewerId, notes)
    await this.claimRepo.persistApproval(approved)

    const ctx = await this.claimRepo.notificationContext(claimId)
    if (!ctx) return
    try {
      await this.emailService.sendClaimApproved(ctx.claimantEmail, ctx.claimantName, ctx.targetName)
    } catch (err) {
      console.error('Reclamo aprobado pero falló el correo de aviso:', err)
    }
  }
}
