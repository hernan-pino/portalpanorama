import { describe, it, expect, vi } from 'vitest'
import { AttachPlacePhotosUseCase, ImageImporter } from './AttachPlacePhotosUseCase'
import { Place, PlaceProps, PlaceImage } from '@domain/place/Place'
import { PlaceStatus } from '@domain/place/PlaceStatus'
import { Slug } from '@domain/shared/Slug'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceRepository } from '../ports/PlaceRepository'

function img(id: string): PlaceImage {
  return { id, url: `https://blob/${id}.webp`, isPrimary: id === 'a', sortOrder: 0 }
}

function makePlace(overrides: Partial<PlaceProps> = {}): Place {
  return Place.create({
    id: 'place_1',
    slug: Slug.fromExisting('la-piojera'),
    name: 'La Piojera',
    categoryId: 'cat_1',
    subcategoryId: 'sub_1',
    communeId: 'com_1',
    paymentMethods: [],
    parkingOptions: [],
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
  })
}

function deps(place: Place | null, importImpl?: ImageImporter['execute']) {
  const save = vi.fn(async (_place: Place) => {})
  const execute = vi.fn(importImpl ?? (async ({ url }: { url: string }) => ({ url: `https://blob/${url.split('/').pop()}` })))
  const placeRepo = { findById: async () => place, save } as unknown as PlaceRepository
  const imageImporter: ImageImporter = { execute }
  return { placeRepo, imageImporter, save, execute }
}

describe('AttachPlacePhotosUseCase', () => {
  it('lanza PlaceNotFoundError si el lugar no existe', async () => {
    const { placeRepo, imageImporter } = deps(null)
    const uc = new AttachPlacePhotosUseCase(placeRepo, imageImporter)
    await expect(uc.execute({ placeId: 'x', photoUrls: ['https://g/1.jpg'] })).rejects.toThrow(
      PlaceNotFoundError,
    )
  })

  it('rehospeda hasta `max` fotos y las adjunta con crédito Google Maps', async () => {
    const { placeRepo, imageImporter, save, execute } = deps(makePlace())
    const uc = new AttachPlacePhotosUseCase(placeRepo, imageImporter)
    const res = await uc.execute({
      placeId: 'place_1',
      photoUrls: ['https://g/1.jpg', 'https://g/2.jpg', 'https://g/3.jpg'],
      max: 2,
    })
    expect(res).toEqual({ status: 'attached', count: 2 })
    expect(execute).toHaveBeenCalledTimes(2)
    const saved = save.mock.calls[0][0] as Place
    expect(saved.images).toHaveLength(2)
    expect(saved.images[0].credit).toBe('Google Maps')
    expect(saved.images[0].alt).toBe('La Piojera')
    expect(saved.primaryImage()).toBeDefined() // garantiza portada
  })

  it('NO toca la ficha que ya tiene imágenes (onlyIfEmpty por defecto)', async () => {
    const { placeRepo, imageImporter, save, execute } = deps(makePlace({ images: [img('a')] }))
    const uc = new AttachPlacePhotosUseCase(placeRepo, imageImporter)
    const res = await uc.execute({ placeId: 'place_1', photoUrls: ['https://g/1.jpg'] })
    expect(res).toEqual({ status: 'skipped', reason: 'has-images' })
    expect(execute).not.toHaveBeenCalled()
    expect(save).not.toHaveBeenCalled()
  })

  it('con onlyIfEmpty=false sí adjunta a una ficha con imágenes (append)', async () => {
    const { placeRepo, imageImporter, save } = deps(makePlace({ images: [img('a')] }))
    const uc = new AttachPlacePhotosUseCase(placeRepo, imageImporter)
    const res = await uc.execute({ placeId: 'place_1', photoUrls: ['https://g/1.jpg'], onlyIfEmpty: false })
    expect(res).toEqual({ status: 'attached', count: 1 })
    const saved = save.mock.calls[0][0] as Place
    expect(saved.images).toHaveLength(2) // la previa + la nueva
  })

  it('skip si no hay fotos', async () => {
    const { placeRepo, imageImporter, save } = deps(makePlace())
    const uc = new AttachPlacePhotosUseCase(placeRepo, imageImporter)
    const res = await uc.execute({ placeId: 'place_1', photoUrls: [] })
    expect(res).toEqual({ status: 'skipped', reason: 'no-photos' })
    expect(save).not.toHaveBeenCalled()
  })

  it('si todas fallan al rehospedar, no guarda y reporta none-rehosted', async () => {
    const { placeRepo, imageImporter, save } = deps(makePlace(), async () => {
      throw new Error('host bloqueado')
    })
    const uc = new AttachPlacePhotosUseCase(placeRepo, imageImporter)
    const res = await uc.execute({ placeId: 'place_1', photoUrls: ['https://g/1.jpg'] })
    expect(res).toEqual({ status: 'skipped', reason: 'none-rehosted' })
    expect(save).not.toHaveBeenCalled()
  })
})
