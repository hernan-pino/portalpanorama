import { DomainError } from '@domain/shared/DomainError'

export class BrandNameRequiredError extends DomainError {
  readonly code = 'BRAND_NAME_REQUIRED'
  constructor() {
    super('El nombre de la marca es obligatorio.')
  }
}
