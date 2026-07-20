import { describe, it, expect } from 'vitest'
import { assertCategoryConsistency } from './assertCategoryConsistency'
import { PlaceWriteInput } from './PlaceWriteInput'
import { CategoryOption } from '../ports/CategoryRepository'
import { PlaceCategoryMismatchError } from '@domain/place/errors/PlaceCategoryMismatchError'

const CATEGORIES: CategoryOption[] = [
  {
    id: 'cat_gastro',
    slug: 'gastronomia',
    name: 'Gastronomía',
    subcategories: [
      { id: 'sub_resto', name: 'Restaurante' },
      { id: 'sub_cafe', name: 'Café' },
    ],
  },
  {
    id: 'cat_cultura',
    slug: 'cultura',
    name: 'Cultura',
    subcategories: [{ id: 'sub_museo', name: 'Museo' }],
  },
]

// Input mínimo; cada test pisa solo los campos de categoría que le importan.
function makeInput(overrides: Partial<PlaceWriteInput> = {}): PlaceWriteInput {
  return {
    name: 'Lugar',
    categoryId: 'cat_gastro',
    subcategoryId: 'sub_resto',
    communeId: 'com_1',
    paymentMethods: [],
    parkingOptions: [],
    socialLinks: [],
    tagIds: [],
    images: [],
    points: [],
    ...overrides,
  }
}

describe('assertCategoryConsistency', () => {
  it('acepta un par categoría/subcategoría válido', () => {
    expect(() => assertCategoryConsistency(makeInput(), CATEGORIES)).not.toThrow()
  })

  it('rechaza una categoría que no existe / no es asignable', () => {
    expect(() =>
      assertCategoryConsistency(makeInput({ categoryId: 'cat_inexistente' }), CATEGORIES),
    ).toThrow(PlaceCategoryMismatchError)
  })

  it('rechaza una subcategoría de otra categoría', () => {
    expect(() =>
      assertCategoryConsistency(makeInput({ subcategoryId: 'sub_museo' }), CATEGORIES),
    ).toThrow(PlaceCategoryMismatchError)
  })

  it('acepta una categoría secundaria con su subcategoría correcta', () => {
    expect(() =>
      assertCategoryConsistency(
        makeInput({ secondaryCategoryId: 'cat_cultura', secondarySubcategoryId: 'sub_museo' }),
        CATEGORIES,
      ),
    ).not.toThrow()
  })

  it('rechaza una subcategoría secundaria que no pertenece a su categoría', () => {
    expect(() =>
      assertCategoryConsistency(
        makeInput({ secondaryCategoryId: 'cat_cultura', secondarySubcategoryId: 'sub_cafe' }),
        CATEGORIES,
      ),
    ).toThrow(PlaceCategoryMismatchError)
  })
})
