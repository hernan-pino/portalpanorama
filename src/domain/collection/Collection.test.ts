import { describe, it, expect } from 'vitest'
import { Collection, CollectionProps, UnauthorizedCollectionAccessError } from './Collection'

function makeProps(overrides: Partial<CollectionProps> = {}): CollectionProps {
  return {
    id: 'col_1',
    name: 'Favoritos',
    ownerId: 'user_1',
    isCurated: false,
    items: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

describe('Collection.addPlace', () => {
  it('agrega un lugar con el sortOrder siguiente', () => {
    const c = Collection.create(makeProps()).addPlace('place_a')
    expect(c.items).toEqual([{ placeId: 'place_a', sortOrder: 0 }])
  })

  it('incrementa el sortOrder al agregar más lugares', () => {
    const c = Collection.create(makeProps()).addPlace('a').addPlace('b')
    expect(c.items.map((i) => i.placeId)).toEqual(['a', 'b'])
    expect(c.items.map((i) => i.sortOrder)).toEqual([0, 1])
  })

  it('es idempotente: no duplica un lugar ya guardado', () => {
    const once = Collection.create(makeProps()).addPlace('a')
    const twice = once.addPlace('a')
    expect(twice.items).toHaveLength(1)
    expect(twice).toBe(once) // misma instancia: no hubo cambio
  })
})

describe('Collection.removePlace', () => {
  it('saca el lugar indicado y deja el resto', () => {
    const c = Collection.create(makeProps()).addPlace('a').addPlace('b').removePlace('a')
    expect(c.items.map((i) => i.placeId)).toEqual(['b'])
  })

  it('sacar un lugar que no está no rompe', () => {
    const c = Collection.create(makeProps()).addPlace('a').removePlace('zzz')
    expect(c.items.map((i) => i.placeId)).toEqual(['a'])
  })
})

describe('Collection.rename', () => {
  it('cambia el nombre', () => {
    expect(Collection.create(makeProps()).rename('Para el finde').name).toBe('Para el finde')
  })
})

describe('Collection.assertOwnership', () => {
  it('no lanza si el usuario es el dueño', () => {
    expect(() => Collection.create(makeProps({ ownerId: 'user_1' })).assertOwnership('user_1')).not.toThrow()
  })

  it('lanza si otro usuario intenta operar la lista (defensa anti-IDOR)', () => {
    expect(() =>
      Collection.create(makeProps({ ownerId: 'user_1' })).assertOwnership('user_2'),
    ).toThrow(UnauthorizedCollectionAccessError)
  })

  it('una lista curada (sin dueño) no pertenece a ningún usuario', () => {
    expect(() =>
      Collection.create(makeProps({ ownerId: undefined, isCurated: true })).assertOwnership('user_1'),
    ).toThrow(UnauthorizedCollectionAccessError)
  })
})
