import { DomainError } from '@domain/shared/DomainError'

// El lugar ya está en el directorio (mismo slug). En la carga del dueño es el caso
// esperado, no un error de sistema: su local ya existe y lo que corresponde es
// reclamarlo, no crear un duplicado.
export class PlaceAlreadyExistsError extends DomainError {
  readonly code = 'PLACE_ALREADY_EXISTS'
  constructor(readonly slug: string) {
    super(`Ya existe un lugar con el slug "${slug}"`)
  }
}
