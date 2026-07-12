import { describe, expect, it, vi } from 'vitest'
import { UpdateOwnedPlaceInfoUseCase } from './UpdateOwnedPlaceInfoUseCase'
import { GetOwnedPlaceForEditUseCase } from './GetOwnedPlaceForEditUseCase'
import { OwnerEditablePlaceView, PlaceRepository } from '../ports/PlaceRepository'
import { UnauthorizedBusinessAccessError } from '@domain/business/errors/UnauthorizedBusinessAccessError'

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
    updateOwnerEditableFields: vi.fn(async () => {}),
  } as unknown as PlaceRepository
}

const fields = { description: 'nuevo horario y datos' }

describe('UpdateOwnedPlaceInfoUseCase — guard anti-IDOR', () => {
  it('el dueño directo puede editar su ficha', async () => {
    const repo = repoWith(view({ ownerId: 'user-1' }))
    await new UpdateOwnedPlaceInfoUseCase(repo).execute('user-1', 'mi-local', fields)
    expect(repo.updateOwnerEditableFields).toHaveBeenCalledWith('place-1', fields)
  })

  it('el dueño de la marca puede editar una sucursal de su marca', async () => {
    const repo = repoWith(view({ ownerId: null, brandOwnerId: 'user-1' }))
    await new UpdateOwnedPlaceInfoUseCase(repo).execute('user-1', 'mi-local', fields)
    expect(repo.updateOwnerEditableFields).toHaveBeenCalledOnce()
  })

  it('un usuario ajeno NO puede editar (ni owner ni dueño de marca)', async () => {
    const repo = repoWith(view({ ownerId: 'otro', brandOwnerId: 'tercero' }))
    await expect(
      new UpdateOwnedPlaceInfoUseCase(repo).execute('user-1', 'mi-local', fields),
    ).rejects.toThrow(UnauthorizedBusinessAccessError)
    expect(repo.updateOwnerEditableFields).not.toHaveBeenCalled()
  })

  it('una ficha sin dueño no la edita nadie por esta vía', async () => {
    const repo = repoWith(view({ ownerId: null, brandOwnerId: null }))
    await expect(
      new UpdateOwnedPlaceInfoUseCase(repo).execute('user-1', 'mi-local', fields),
    ).rejects.toThrow(UnauthorizedBusinessAccessError)
  })

  it('GetOwnedPlaceForEdit aplica el mismo guard', async () => {
    const repo = repoWith(view({ ownerId: 'otro', brandOwnerId: null }))
    await expect(
      new GetOwnedPlaceForEditUseCase(repo).execute('user-1', 'mi-local'),
    ).rejects.toThrow(UnauthorizedBusinessAccessError)
  })
})
