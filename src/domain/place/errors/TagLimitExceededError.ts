import { DomainError } from '@domain/shared/DomainError'
import { TagLayer } from '@domain/catalog/TagLayer'

export class TagLimitExceededError extends DomainError {
  readonly code = 'TAG_LIMIT_EXCEEDED'
  constructor(layer: TagLayer, max: number) {
    super(`Un lugar admite como máximo ${max} tags de la capa ${layer}`)
  }
}
