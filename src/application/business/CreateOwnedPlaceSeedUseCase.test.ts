import { describe, expect, it, vi } from 'vitest'
import { Place } from '@domain/place/Place'
import { PlaceAlreadyExistsError } from '@domain/place/errors/PlaceAlreadyExistsError'
import { InvalidCommuneError } from '@domain/place/errors/InvalidCommuneError'
import { CreateOwnedPlaceSeedUseCase, OwnedPlaceSeedInput } from './CreateOwnedPlaceSeedUseCase'
import { CreateBusinessClaimUseCase } from './CreateBusinessClaimUseCase'
import { PlaceRepository } from '../ports/PlaceRepository'
import { LocationRepository } from '../ports/LocationRepository'
import { CreatePlaceUseCase } from '../place/CreatePlaceUseCase'

const seed: OwnedPlaceSeedInput = {
  submitterId: 'user-1',
  submitterName: 'Ana',
  submitterEmail: 'ana@cafealtura.cl',
  name: 'Café Altura',
  address: 'Av. Italia 1234',
  communeId: 'commune-1',
  categoryId: 'cat-1',
  subcategoryId: 'sub-1',
  role: 'Dueño/a',
  phone: '+56 9 1234 5678',
}

function setup(existing: Place | null, communeIds = ['commune-1']) {
  const placeRepo = { findBySlug: vi.fn(async () => existing) } as unknown as PlaceRepository
  const locationRepo = {
    listCommunes: vi.fn(async () => communeIds.map((id) => ({ id, name: id }))),
  } as unknown as LocationRepository
  const createPlace = {
    execute: vi.fn(async () => ({ placeId: 'place-1' })),
  } as unknown as CreatePlaceUseCase
  const createClaim = { execute: vi.fn(async () => {}) } as unknown as CreateBusinessClaimUseCase
  return {
    uc: new CreateOwnedPlaceSeedUseCase(placeRepo, locationRepo, createPlace, createClaim),
    createPlace,
    createClaim,
  }
}

describe('CreateOwnedPlaceSeedUseCase', () => {
  it('crea la ficha SIN dueño y abre un reclamo para que el admin decida la propiedad', async () => {
    const { uc, createPlace, createClaim } = setup(null)

    const result = await uc.execute(seed)

    expect(result).toEqual({ placeId: 'place-1' })

    // Que la semilla NO asigne ownerId es lo que impide el squatting: mandar la ficha
    // de un local ajeno no te hace su dueño, y el dueño real todavía puede reclamarla.
    const placeInput = vi.mocked(createPlace.execute).mock.calls[0][0]
    expect(placeInput).not.toHaveProperty('ownerId')
    expect(placeInput).toMatchObject({ name: 'Café Altura', tagIds: [], images: [] })

    expect(createClaim.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        claimantId: 'user-1',
        placeId: 'place-1',
        targetName: 'Café Altura',
        claimantRole: 'Dueño/a',
      }),
    )
  })

  it('rechaza el duplicado: si el lugar ya está en el directorio, va por el reclamo', async () => {
    const { uc, createPlace, createClaim } = setup({ id: 'existing' } as unknown as Place)

    await expect(uc.execute(seed)).rejects.toBeInstanceOf(PlaceAlreadyExistsError)
    // El intento duplicado no deja nada a medio camino.
    expect(createPlace.execute).not.toHaveBeenCalled()
    expect(createClaim.execute).not.toHaveBeenCalled()
  })

  it('rechaza una comuna fuera del catálogo (payload manipulado)', async () => {
    const { uc, createPlace } = setup(null, ['otra-commune'])

    await expect(uc.execute(seed)).rejects.toBeInstanceOf(InvalidCommuneError)
    expect(createPlace.execute).not.toHaveBeenCalled()
  })
})

describe('CreateOwnedPlaceSeedUseCase — rubro propuesto', () => {
  it('lleva el rubro propuesto al admin en la solicitud (no crea la subcategoría)', async () => {
    const { uc, createPlace, createClaim } = setup(null)

    await uc.execute({ ...seed, categorySuggestion: 'cervecería artesanal' })

    // La ficha se crea con el rubro del catálogo que el dueño eligió; la propuesta es
    // solo una señal para el admin, que decide si abre la subcategoría nueva.
    expect(vi.mocked(createPlace.execute).mock.calls[0][0].subcategoryId).toBe('sub-1')
    expect(vi.mocked(createClaim.execute).mock.calls[0][0].message).toContain('cervecería artesanal')
  })
})
