import { DomainError } from '@domain/shared/DomainError'

export class BrandNotFoundError extends DomainError {
  readonly code = 'BRAND_NOT_FOUND'
  constructor(idOrSlug: string) {
    super(`No se encontró la marca: "${idOrSlug}".`)
  }
}
