import { DomainError } from '@domain/shared/DomainError'

// Errores de aplicación (transversales a use cases). Los específicos de un
// agregado viven en su carpeta de dominio.

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED'
  constructor(message = 'No autorizado para realizar esta acción') {
    super(message)
  }
}
