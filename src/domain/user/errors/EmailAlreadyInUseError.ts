import { DomainError } from '@domain/shared/DomainError'

export class EmailAlreadyInUseError extends DomainError {
  readonly code = 'EMAIL_ALREADY_IN_USE'
  constructor(email: string) {
    super(`El email "${email}" ya está registrado`)
  }
}
