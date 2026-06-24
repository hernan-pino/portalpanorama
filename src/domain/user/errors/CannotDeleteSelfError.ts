import { DomainError } from '@domain/shared/DomainError'

// Un admin no puede borrar su propia cuenta desde el panel (footgun + quedarse sin acceso).
export class CannotDeleteSelfError extends DomainError {
  readonly code = 'CANNOT_DELETE_SELF'
  constructor() {
    super('No puedes eliminar tu propia cuenta desde el panel.')
  }
}
