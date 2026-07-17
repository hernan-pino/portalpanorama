import { describe, it, expect } from 'vitest'
import { TAG_LIMITS, tagLimitFor } from './tagLimits'
import { Place } from './Place'
import { TagLayer } from '@domain/catalog/TagLayer'

describe('tagLimits', () => {
  it('es la fuente única: la entidad no declara sus propios números', () => {
    expect(Place.MAX_AUDIENCE_TAGS).toBe(TAG_LIMITS[TagLayer.AUDIENCE])
    expect(Place.MAX_OCCASION_TAGS).toBe(TAG_LIMITS[TagLayer.OCCASION])
    expect(Place.MAX_VIBE_TAGS).toBe(TAG_LIMITS[TagLayer.VIBE])
  })

  it('OCCASION admite 4: "Para días de lluvia" tiene que caber junto a las 3 ocasiones básicas', () => {
    // Regresión de la s37: con tope 3, 38 lugares publicados (museos, escape rooms,
    // karaokes) quedaron inválidos y reventaban al hidratarse desde la BD.
    expect(TAG_LIMITS[TagLayer.OCCASION]).toBe(4)
  })

  it('solo topean las capas subjetivas', () => {
    expect(tagLimitFor(TagLayer.AUDIENCE)).toBe(4)
    expect(tagLimitFor(TagLayer.OCCASION)).toBe(4)
    expect(tagLimitFor(TagLayer.VIBE)).toBe(3)
    for (const libre of [TagLayer.EXPERIENCE, TagLayer.SERVICE, TagLayer.SPECIFIC, TagLayer.CUISINE]) {
      expect(tagLimitFor(libre)).toBeUndefined()
    }
  })

  it('tolera un layer desconocido', () => {
    expect(tagLimitFor('NO_EXISTE')).toBeUndefined()
  })
})
