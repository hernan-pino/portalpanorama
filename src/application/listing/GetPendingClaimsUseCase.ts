import { PendingClaimView, ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'
import { UnauthorizedError } from '../errors'

export interface GetPendingClaimsOutput {
  claims: PendingClaimView[]
}

export class GetPendingClaimsUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(adminId: string): Promise<GetPendingClaimsOutput> {
    const admin = await this.userRepo.findById(adminId)
    if (!admin || !admin.isAdmin()) throw new UnauthorizedError('Solo admins pueden ver claims pendientes')

    const claims = await this.listingRepo.findPendingClaims()
    return { claims }
  }
}
