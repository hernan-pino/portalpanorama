import { DomainError } from '@domain/shared/DomainError'

// Un usuario intentó ver/editar una ficha que no gestiona (no es su owner ni
// dueño de su marca). Defensa anti-IDOR del panel de negocio.
export class UnauthorizedBusinessAccessError extends DomainError {
  readonly code = 'UNAUTHORIZED_BUSINESS_ACCESS'
  constructor(userId: string, placeSlug: string) {
    super(`El usuario "${userId}" no gestiona el lugar "${placeSlug}"`)
  }
}
