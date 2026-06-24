import { DomainError } from '@domain/shared/DomainError'

export class InvalidCurrentPasswordError extends DomainError {
  readonly code = 'INVALID_CURRENT_PASSWORD'
  constructor() {
    super('La contraseña actual no es correcta')
  }
}
