import { PendingTagView, ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'
import { UnauthorizedError } from '../errors'

export interface GetPendingTagsOutput {
  tags: PendingTagView[]
}

export class GetPendingTagsUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(adminId: string): Promise<GetPendingTagsOutput> {
    const admin = await this.userRepo.findById(adminId)
    if (!admin || !admin.isAdmin()) throw new UnauthorizedError('Solo admins pueden ver tags pendientes')

    const tags = await this.listingRepo.findPendingTags()
    return { tags }
  }
}
