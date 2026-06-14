import { DomainError } from '@domain/shared/DomainError'

// La subcategoría elegida no pertenece a su categoría (ni la principal ni la
// secundaria). El form de admin lo previene cableando los selectores, pero el use
// case lo blinda igual: un cliente desactualizado, un import o un payload armado a
// mano no deben poder grabar un par categoría/subcategoría inconsistente.
export class PlaceCategoryMismatchError extends DomainError {
  readonly code = 'PLACE_CATEGORY_MISMATCH'
  constructor(message = 'La subcategoría no pertenece a la categoría elegida.') {
    super(message)
  }
}
