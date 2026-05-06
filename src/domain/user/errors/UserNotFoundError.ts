import { DomainError } from '@domain/shared/DomainError'

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND'
  constructor(idOrEmail: string) {
    super(`Usuario no encontrado: "${idOrEmail}"`)
  }
}
