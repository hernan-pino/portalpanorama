import { DomainError } from '@domain/shared/DomainError'

// Evita el footgun de que un admin se quite a sí mismo el rol y quede fuera del panel.
export class CannotDemoteSelfError extends DomainError {
  readonly code = 'CANNOT_DEMOTE_SELF'
  constructor() {
    super('No puedes quitarte a ti mismo el rol de administrador.')
  }
}
