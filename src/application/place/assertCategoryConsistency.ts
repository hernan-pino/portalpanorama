import { PlaceCategoryMismatchError } from '@domain/place/errors/PlaceCategoryMismatchError'
import { CategoryOption } from '../ports/CategoryRepository'
import { PlaceWriteInput } from './PlaceWriteInput'

// Verifica que cada subcategoría pertenezca a su categoría usando el catálogo
// asignable (activo, no event-only). Si la categoría no es asignable o el par no
// coincide, lanza PlaceCategoryMismatchError. Compartido por create y update.
export function assertCategoryConsistency(
  input: PlaceWriteInput,
  categories: CategoryOption[],
): void {
  const byId = new Map(categories.map((c) => [c.id, c]))

  const primary = byId.get(input.categoryId)
  if (!primary) {
    throw new PlaceCategoryMismatchError('La categoría elegida no existe o no es asignable.')
  }
  if (!primary.subcategories.some((s) => s.id === input.subcategoryId)) {
    throw new PlaceCategoryMismatchError()
  }

  if (input.secondaryCategoryId) {
    const secondary = byId.get(input.secondaryCategoryId)
    if (!secondary) {
      throw new PlaceCategoryMismatchError(
        'La categoría secundaria elegida no existe o no es asignable.',
      )
    }
    if (
      input.secondarySubcategoryId &&
      !secondary.subcategories.some((s) => s.id === input.secondarySubcategoryId)
    ) {
      throw new PlaceCategoryMismatchError('La subcategoría secundaria no pertenece a su categoría.')
    }
  }
}
