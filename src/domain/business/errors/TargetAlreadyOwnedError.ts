import { DomainError } from '@domain/shared/DomainError'

// La ficha/marca ya tiene un dueño verificado (ownerId seteado): no se re-reclama
// por formulario; un traspaso de propiedad lo resuelve el admin a mano.
export class TargetAlreadyOwnedError extends DomainError {
  readonly code = 'TARGET_ALREADY_OWNED'
  constructor() {
    super('Este lugar o marca ya tiene un dueño verificado')
  }
}
