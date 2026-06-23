import { DomainError } from '@domain/shared/DomainError'

export class InvalidResetTokenError extends DomainError {
  readonly code = 'INVALID_RESET_TOKEN'
  constructor() {
    super('El enlace de recuperación es inválido o expiró')
  }
}
