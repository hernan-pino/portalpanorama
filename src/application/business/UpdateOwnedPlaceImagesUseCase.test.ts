import { describe, expect, it, vi } from 'vitest'
import { UpdateOwnedPlaceImagesUseCase } from './UpdateOwnedPlaceImagesUseCase'
import { OwnerEditablePlaceView, OwnerImageInput, PlaceRepository } from '../ports/PlaceRepository'
import { UnauthorizedBusinessAccessError } from '@domain/business/errors/UnauthorizedBusinessAccessError'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'

function view(overrides: Partial<OwnerEditablePlaceView> = {}): OwnerEditablePlaceView {
  return {
    id: 'place-1',
    slug: 'mi-local',
    name: 'Mi Local',
    categoryName: 'Gastronomía',
    communeName: 'Providencia',
    ownerId: 'user-1',
    brandOwnerId: null,
    images: [],
    ...overrides,
  }
}

function repoWith(v: OwnerEditablePlaceView | null): PlaceRepository {
  return {
    findOwnerEditableBySlug: vi.fn(async () => v),
    updateOwnerImages: vi.fn(async () => {}),
  } as unknown as PlaceRepository
}

const images: OwnerImageInput[] = [{ url: 'https://x.public.blob.vercel-storage.com/a.webp', isPrimary: true }]

describe('UpdateOwnedPlaceImagesUseCase — guard anti-IDOR', () => {
  it('el dueño directo puede reemplazar sus fotos', async () => {
    const repo = repoWith(view({ ownerId: 'user-1' }))
    await new UpdateOwnedPlaceImagesUseCase(repo).execute('user-1', 'mi-local', images)
    expect(repo.updateOwnerImages).toHaveBeenCalledWith('place-1', images)
  })

  it('el dueño de la marca puede gestionar las fotos de una sucursal', async () => {
    const repo = repoWith(view({ ownerId: null, brandOwnerId: 'user-1' }))
    await new UpdateOwnedPlaceImagesUseCase(repo).execute('user-1', 'mi-local', images)
    expect(repo.updateOwnerImages).toHaveBeenCalledOnce()
  })

  it('un usuario ajeno NO puede tocar las fotos', async () => {
    const repo = repoWith(view({ ownerId: 'otro', brandOwnerId: 'tercero' }))
    await expect(
      new UpdateOwnedPlaceImagesUseCase(repo).execute('user-1', 'mi-local', images),
    ).rejects.toThrow(UnauthorizedBusinessAccessError)
    expect(repo.updateOwnerImages).not.toHaveBeenCalled()
  })

  it('lanza si la ficha no existe', async () => {
    const repo = repoWith(null)
    await expect(
      new UpdateOwnedPlaceImagesUseCase(repo).execute('user-1', 'mi-local', images),
    ).rejects.toThrow(PlaceNotFoundError)
  })
})
