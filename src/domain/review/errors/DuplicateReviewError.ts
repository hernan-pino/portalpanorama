import { DomainError } from '@domain/shared/DomainError'

export class DuplicateReviewError extends DomainError {
  readonly code = 'DUPLICATE_REVIEW'
  constructor(targetId: string, userId: string) {
    super(`El usuario "${userId}" ya tiene una reseña para el objetivo "${targetId}"`)
  }
}
