import { BusinessClaimRepository } from '../ports/BusinessClaimRepository'

/**
 * ¿Tiene sentido que este usuario reclame este objetivo?
 *
 * El reclamo ya se defendía al ENVIAR (duplicado / objetivo con dueño), pero el usuario
 * se enteraba recién después de llenar el formulario completo. Esto permite responder
 * antes de mostrarlo, y decidir si el CTA "¿Este negocio es tuyo?" corresponde siquiera.
 */
export type ClaimEligibility =
  | 'FREE' // se puede reclamar
  | 'MISSING' // el objetivo ya no existe
  | 'OWNED_BY_YOU' // ya es tuyo: al panel
  | 'OWNED_BY_OTHER' // otro lo reclamó y quedó verificado
  | 'PENDING_YOURS' // ya mandaste una solicitud y está en revisión

export interface ClaimEligibilityInput {
  claimantId: string
  placeId?: string
  brandId?: string
}

export class GetClaimEligibilityUseCase {
  constructor(private readonly claimRepo: BusinessClaimRepository) {}

  async execute(input: ClaimEligibilityInput): Promise<ClaimEligibility> {
    const target = { placeId: input.placeId, brandId: input.brandId }

    const ownership = await this.claimRepo.targetOwnership(target)
    if (!ownership) return 'MISSING'
    if (ownership.ownerId) {
      return ownership.ownerId === input.claimantId ? 'OWNED_BY_YOU' : 'OWNED_BY_OTHER'
    }

    // Libre, pero puede que este mismo usuario ya lo haya pedido.
    return (await this.claimRepo.hasPending(input.claimantId, target)) ? 'PENDING_YOURS' : 'FREE'
  }
}
