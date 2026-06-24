import { DomainError } from '@domain/shared/DomainError'

// La cuenta entró por OAuth (Google) y nunca definió una contraseña local:
// no hay nada que "cambiar". El flujo correcto sería "recuperar contraseña"
// para crear una por primera vez.
export class NoPasswordSetError extends DomainError {
  readonly code = 'NO_PASSWORD_SET'
  constructor() {
    super('Esta cuenta no tiene una contraseña configurada')
  }
}
