import { describe, it, expect } from 'vitest'
import { Place, PlaceProps, PlaceTagRef, PlaceImage } from './Place'
import { PlaceStatus } from './PlaceStatus'
import { TagLayer } from '@domain/catalog/TagLayer'
import { Slug } from '@domain/shared/Slug'
import { TagLimitExceededError } from './errors/TagLimitExceededError'
import { PlaceCycleError } from './errors/PlaceCycleError'
import { InvalidPlaceTransitionError } from './errors/InvalidPlaceTransitionError'

// Ficha de dominio mínima válida. Cada test pisa solo lo que le importa.
function makeProps(overrides: Partial<PlaceProps> = {}): PlaceProps {
  return {
    id: 'place_1',
    slug: Slug.fromExisting('bar-de-prueba'),
    name: 'Bar de prueba',
    categoryId: 'cat_1',
    subcategoryId: 'sub_1',
    communeId: 'com_1',
    paymentMethods: [],
    socialLinks: [],
    score: 0,
    isPremium: false,
    status: PlaceStatus.PENDING_REVIEW,
    images: [],
    points: [],
    tags: [],
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  }
}

function tag(slug: string, layer: TagLayer): PlaceTagRef {
  return { id: `tag_${slug}`, slug, name: slug, layer }
}

function repeatTags(layer: TagLayer, n: number): PlaceTagRef[] {
  return Array.from({ length: n }, (_, i) => tag(`${layer}-${i}`, layer))
}

describe('Place.create — límites de tags', () => {
  it('acepta hasta el tope de cada capa subjetiva', () => {
    expect(() =>
      Place.create(
        makeProps({
          tags: [
            ...repeatTags(TagLayer.AUDIENCE, Place.MAX_AUDIENCE_TAGS),
            ...repeatTags(TagLayer.OCCASION, Place.MAX_OCCASION_TAGS),
            ...repeatTags(TagLayer.VIBE, Place.MAX_VIBE_TAGS),
          ],
        }),
      ),
    ).not.toThrow()
  })

  it('rechaza pasar el tope de AUDIENCE (máx 4)', () => {
    expect(() =>
      Place.create(makeProps({ tags: repeatTags(TagLayer.AUDIENCE, Place.MAX_AUDIENCE_TAGS + 1) })),
    ).toThrow(TagLimitExceededError)
  })

  it('rechaza pasar el tope de OCCASION (máx 3)', () => {
    expect(() =>
      Place.create(makeProps({ tags: repeatTags(TagLayer.OCCASION, Place.MAX_OCCASION_TAGS + 1) })),
    ).toThrow(TagLimitExceededError)
  })

  it('rechaza pasar el tope de VIBE (máx 3)', () => {
    expect(() =>
      Place.create(makeProps({ tags: repeatTags(TagLayer.VIBE, Place.MAX_VIBE_TAGS + 1) })),
    ).toThrow(TagLimitExceededError)
  })

  it('las capas objetivas (EXPERIENCE/SERVICE/SPECIFIC) no tienen tope', () => {
    expect(() =>
      Place.create(
        makeProps({
          tags: [
            ...repeatTags(TagLayer.EXPERIENCE, 12),
            ...repeatTags(TagLayer.SERVICE, 12),
            ...repeatTags(TagLayer.SPECIFIC, 12),
          ],
        }),
      ),
    ).not.toThrow()
  })
})

describe('Place.create — anti-ciclo trivial', () => {
  it('un lugar no puede ser su propio padre', () => {
    expect(() => Place.create(makeProps({ id: 'p1', parentId: 'p1' }))).toThrow(PlaceCycleError)
  })

  it('un padre distinto es válido (el ciclo transitivo lo cuida el use case, no el dominio)', () => {
    expect(() => Place.create(makeProps({ id: 'p1', parentId: 'p2' }))).not.toThrow()
  })
})

describe('Place — transiciones de estado', () => {
  it('publish() lleva de PENDING_REVIEW a PUBLISHED', () => {
    const p = Place.create(makeProps({ status: PlaceStatus.PENDING_REVIEW })).publish()
    expect(p.status).toBe(PlaceStatus.PUBLISHED)
    expect(p.isPublished()).toBe(true)
  })

  it('publish() reactiva un ARCHIVED', () => {
    expect(Place.create(makeProps({ status: PlaceStatus.ARCHIVED })).publish().status).toBe(
      PlaceStatus.PUBLISHED,
    )
  })

  it('publish() sobre PUBLISHED es idempotente (devuelve la misma instancia)', () => {
    const p = Place.create(makeProps({ status: PlaceStatus.PUBLISHED }))
    expect(p.publish()).toBe(p)
  })

  it('archive() lleva cualquier estado a ARCHIVED', () => {
    expect(Place.create(makeProps({ status: PlaceStatus.PUBLISHED })).archive().status).toBe(
      PlaceStatus.ARCHIVED,
    )
  })

  it('sendToReview() devuelve un PUBLISHED a PENDING_REVIEW', () => {
    expect(Place.create(makeProps({ status: PlaceStatus.PUBLISHED })).sendToReview().status).toBe(
      PlaceStatus.PENDING_REVIEW,
    )
  })

  it('sendToReview() sobre un ARCHIVED es una transición inválida', () => {
    expect(() => Place.create(makeProps({ status: PlaceStatus.ARCHIVED })).sendToReview()).toThrow(
      InvalidPlaceTransitionError,
    )
  })

  it('withScore() reemplaza el score sin tocar el resto', () => {
    const p = Place.create(makeProps({ score: 0 })).withScore(4.3)
    expect(p.score).toBe(4.3)
    expect(p.name).toBe('Bar de prueba')
  })
})

describe('Place.primaryImage', () => {
  const img = (id: string, isPrimary: boolean): PlaceImage => ({
    id,
    url: `https://x/${id}.jpg`,
    isPrimary,
    sortOrder: 0,
  })

  it('devuelve la imagen marcada como principal', () => {
    const p = Place.create(makeProps({ images: [img('a', false), img('b', true)] }))
    expect(p.primaryImage()?.id).toBe('b')
  })

  it('si ninguna es principal, cae a la primera', () => {
    const p = Place.create(makeProps({ images: [img('a', false), img('b', false)] }))
    expect(p.primaryImage()?.id).toBe('a')
  })

  it('sin imágenes devuelve undefined', () => {
    expect(Place.create(makeProps({ images: [] })).primaryImage()).toBeUndefined()
  })
})
