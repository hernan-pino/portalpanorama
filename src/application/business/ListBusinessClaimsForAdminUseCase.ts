import { BusinessClaimRepository, ClaimAdminRow } from '../ports/BusinessClaimRepository'

// Bandeja de reclamos del admin ("¿Este negocio es tuyo?").
export class ListBusinessClaimsForAdminUseCase {
  constructor(private readonly claimRepo: BusinessClaimRepository) {}

  execute(): Promise<ClaimAdminRow[]> {
    return this.claimRepo.listForAdmin()
  }
}
