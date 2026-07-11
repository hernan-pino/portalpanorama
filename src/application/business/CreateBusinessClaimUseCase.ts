import { createId } from '@paralleldrive/cuid2'
import { BusinessClaim } from '@domain/business/BusinessClaim'
import { ClaimStatus } from '@domain/business/ClaimStatus'
import { DuplicateClaimError } from '@domain/business/errors/DuplicateClaimError'
import { TargetAlreadyOwnedError } from '@domain/business/errors/TargetAlreadyOwnedError'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { BusinessClaimRepository } from '../ports/BusinessClaimRepository'
import { EmailService } from '../ports/EmailService'

export interface CreateBusinessClaimInput {
  claimantId: string
  claimantName: string
  claimantEmail: string
  /** Exactamente uno de los dos (invariante del dominio). */
  placeId?: string
  brandId?: string
  /** Nombre del lugar/marca — solo para el correo de confirmación. */
  targetName: string
  claimantRole?: string
  message?: string
  evidenceUrl?: string
  contactEmail?: string
  contactPhone?: string
}

// "¿Este negocio es tuyo?" — crea el reclamo que el admin revisa a mano (spec §3/§6).
// Requiere sesión (el claimant es un User); la validación de forma va en la action (Zod).
export class CreateBusinessClaimUseCase {
  constructor(
    private readonly claimRepo: BusinessClaimRepository,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: CreateBusinessClaimInput): Promise<void> {
    const target = { placeId: input.placeId, brandId: input.brandId }

    const claim = BusinessClaim.create({
      id: createId(),
      claimantId: input.claimantId,
      placeId: input.placeId,
      brandId: input.brandId,
      claimantRole: input.claimantRole,
      message: input.message,
      evidenceUrl: input.evidenceUrl,
      // Sin contacto explícito, el admin verifica contra el email de la cuenta.
      contactEmail: input.contactEmail ?? input.claimantEmail,
      contactPhone: input.contactPhone,
      status: ClaimStatus.PENDING,
      createdAt: new Date(),
    })

    const state = await this.claimRepo.targetState(target)
    if (state === 'MISSING') throw new PlaceNotFoundError(input.placeId ?? input.brandId ?? '')
    if (state === 'OWNED') throw new TargetAlreadyOwnedError()

    if (await this.claimRepo.hasPending(input.claimantId, target)) {
      throw new DuplicateClaimError()
    }

    await this.claimRepo.create(claim)

    // El correo es cortesía: si falla, el reclamo igual quedó creado.
    try {
      await this.emailService.sendClaimReceived(input.claimantEmail, input.claimantName, input.targetName)
    } catch (err) {
      console.error('Reclamo creado pero falló el correo de confirmación:', err)
    }
  }
}
