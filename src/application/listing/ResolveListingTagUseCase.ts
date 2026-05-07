import { DomainError } from '@domain/shared/DomainError'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { ListingRepository } from '../ports/ListingRepository'
import { UserRepository } from '../ports/UserRepository'
import { UnauthorizedError } from '../errors'

export class TagNotFoundError extends DomainError {
  readonly code = 'TAG_NOT_FOUND'
  constructor(tagId: string) {
    super(`Tag "${tagId}" no encontrado en el listing`)
  }
}

export interface ResolveListingTagInput {
  tagId: string
  listingId: string
  adminId: string
  decision: 'APPROVE' | 'REJECT'
}

export class ResolveListingTagUseCase {
  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async execute(input: ResolveListingTagInput): Promise<void> {
    const admin = await this.userRepo.findById(input.adminId)
    if (!admin || !admin.isAdmin()) throw new UnauthorizedError('Solo admins pueden resolver tags')

    const listing = await this.listingRepo.findById(input.listingId)
    if (!listing) throw new ListingNotFoundError(input.listingId)

    const tag = listing.tags.find((t) => t.id === input.tagId)
    if (!tag) throw new TagNotFoundError(input.tagId)

    const updated =
      input.decision === 'APPROVE'
        ? listing.approveTag(input.tagId)
        : listing.rejectTag(input.tagId)

    await this.listingRepo.save(updated)
  }
}
