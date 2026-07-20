import { describe, it, expect, vi } from 'vitest'
import { EnrichPlaceRatingUseCase } from './EnrichPlaceRatingUseCase'
import { Place, PlaceProps } from '@domain/place/Place'
import { PlaceStatus } from '@domain/place/PlaceStatus'
import { Slug } from '@domain/shared/Slug'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceRepository } from '../ports/PlaceRepository'
import { LocationRepository } from '../ports/LocationRepository'
import { PlaceRatingProvider, RatingResult } from '../ports/PlaceRatingProvider'

function makePlace(overrides: Partial<PlaceProps> = {}): Place {
  return Place.create({
    id: 'place_1',
    slug: Slug.fromExisting('parque-bicentenario'),
    name: 'Parque Bicentenario',
    categoryId: 'cat_1',
    subcategoryId: 'sub_1',
    communeId: 'com_vitacura',
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

// Repo/location/provider mínimos; cada test pisa lo que necesita.
function deps(place: Place | null, lookupResult: RatingResult | null) {
  const save = vi.fn(async (_place: Place) => {})
  const lookup = vi.fn(async () => lookupResult)
  const placeRepo: PlaceRepository = {
    findById: async () => place,
    save,
    globalAverageRating: async () => 4.2,
    // Sin muestra por categoría → Score.prior cae al promedio global (4.2).
    categoryRatingStats: async () => [],
  } as unknown as PlaceRepository
  const locationRepo: LocationRepository = {
    listCommunes: async () => [{ id: 'com_vitacura', name: 'Vitacura' }],
    listNeighborhoods: async () => [],
    listMetroStations: async () => [],
  }
  const ratingProvider: PlaceRatingProvider = { lookup }
  return { placeRepo, locationRepo, ratingProvider, save, lookup }
}

describe('EnrichPlaceRatingUseCase', () => {
  it('lanza PlaceNotFoundError si el lugar no existe', async () => {
    const { placeRepo, locationRepo, ratingProvider } = deps(null, null)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    await expect(uc.execute({ placeId: 'x' })).rejects.toThrow(PlaceNotFoundError)
  })

  it('salta el lugar que ya tiene rating si no se fuerza', async () => {
    const place = makePlace({ googlePlaceId: 'ChIJexistente' })
    const { placeRepo, locationRepo, ratingProvider, lookup, save } = deps(place, null)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    const res = await uc.execute({ placeId: 'place_1' })
    expect(res).toEqual({ status: 'skipped', reason: 'already-has-rating' })
    expect(lookup).not.toHaveBeenCalled()
    expect(save).not.toHaveBeenCalled()
  })

  it('re-consulta un lugar con rating si force=true (búsqueda exacta por place_id)', async () => {
    const place = makePlace({ googlePlaceId: 'ChIJexistente', address: 'Av. Bicentenario 3236' })
    const result: RatingResult = { googlePlaceId: 'ChIJexistente', googleRating: 4.8, googleReviewCount: 100, photoUrls: [] }
    const { placeRepo, locationRepo, ratingProvider, lookup } = deps(place, result)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    const res = await uc.execute({ placeId: 'place_1', force: true })
    expect(res.status).toBe('updated')
    expect(lookup).toHaveBeenCalledWith({
      name: 'Parque Bicentenario',
      address: 'Av. Bicentenario 3236',
      commune: 'Vitacura',
      knownPlaceId: 'ChIJexistente',
    })
  })

  it('pasa la dirección de la ficha a la query (fija la sucursal en marcas multi-local)', async () => {
    const place = makePlace({ address: 'José Victorino Lastarria 71' })
    const result: RatingResult = { googlePlaceId: 'ChIJx', googleRating: 4.3, googleReviewCount: 1200, photoUrls: [] }
    const { placeRepo, locationRepo, ratingProvider, lookup } = deps(place, result)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    await uc.execute({ placeId: 'place_1' })
    expect(lookup).toHaveBeenCalledWith({
      name: 'Parque Bicentenario',
      address: 'José Victorino Lastarria 71',
      commune: 'Vitacura',
      knownPlaceId: undefined,
    })
  })

  it('devuelve not-found si el proveedor no encontró el lugar', async () => {
    const { placeRepo, locationRepo, ratingProvider, save } = deps(makePlace(), null)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    const res = await uc.execute({ placeId: 'place_1' })
    expect(res).toEqual({ status: 'not-found' })
    expect(save).not.toHaveBeenCalled()
  })

  it('setea la reputación, recalcula el score bayesiano y guarda', async () => {
    const result: RatingResult = {
      googlePlaceId: 'ChIJnuevo',
      googleRating: 4.6,
      googleReviewCount: 50,
      matchedName: 'Parque Bicentenario',
      matchedAddress: 'Av. Bicentenario 3236, Vitacura',
      photoUrls: ['https://x/1.jpg'],
    }
    const { placeRepo, locationRepo, ratingProvider, save } = deps(makePlace(), result)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    const res = await uc.execute({ placeId: 'place_1' })

    expect(res.status).toBe('updated')
    if (res.status !== 'updated') return
    expect(res.nameMatch).toBe(true)
    // bayesiano con m=50, C=4.2, v=50, R=4.6 → (50/100)*4.6 + (50/100)*4.2 = 4.4
    expect(res.score).toBeCloseTo(4.4, 5)

    expect(save).toHaveBeenCalledOnce()
    const saved = save.mock.calls[0][0] as Place
    expect(saved.googlePlaceId).toBe('ChIJnuevo')
    expect(saved.googleRating).toBe(4.6)
    expect(saved.score).toBeCloseTo(4.4, 5)
    expect(saved.status).toBe(PlaceStatus.PENDING_REVIEW) // estado intacto
  })

  it('captura las coords de Google cuando la ficha no tiene', async () => {
    const result: RatingResult = {
      googlePlaceId: 'ChIJnuevo',
      googleRating: 4.6,
      googleReviewCount: 50,
      photoUrls: [],
      latitude: -33.4015,
      longitude: -70.5836,
    }
    const { placeRepo, locationRepo, ratingProvider, save } = deps(makePlace(), result)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    const res = await uc.execute({ placeId: 'place_1' })

    expect(res.status).toBe('updated')
    if (res.status !== 'updated') return
    expect(res.coordsSet).toBe(true)
    const saved = save.mock.calls[0][0] as Place
    expect(saved.lat).toBeCloseTo(-33.4015, 5)
    expect(saved.lng).toBeCloseTo(-70.5836, 5)
  })

  it('NO pisa las coords curadas a mano aunque Google traiga otras', async () => {
    const place = makePlace({ lat: -33.1111, lng: -70.2222 })
    const result: RatingResult = {
      googlePlaceId: 'ChIJnuevo',
      googleRating: 4.6,
      googleReviewCount: 50,
      photoUrls: [],
      latitude: -33.9999,
      longitude: -70.9999,
    }
    const { placeRepo, locationRepo, ratingProvider, save } = deps(place, result)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    const res = await uc.execute({ placeId: 'place_1' })

    expect(res.status).toBe('updated')
    if (res.status !== 'updated') return
    expect(res.coordsSet).toBe(false)
    const saved = save.mock.calls[0][0] as Place
    expect(saved.lat).toBeCloseTo(-33.1111, 5) // intacto
    expect(saved.lng).toBeCloseTo(-70.2222, 5)
  })

  it('en dryRun resuelve el match y el score pero NO persiste', async () => {
    const result: RatingResult = { googlePlaceId: 'ChIJnuevo', googleRating: 4.6, googleReviewCount: 50, photoUrls: [] }
    const { placeRepo, locationRepo, ratingProvider, save } = deps(makePlace(), result)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    const res = await uc.execute({ placeId: 'place_1', dryRun: true })
    expect(res.status).toBe('updated')
    expect(save).not.toHaveBeenCalled()
  })

  it('marca nameMatch=false cuando el local que devolvió Google no se parece', async () => {
    const result: RatingResult = {
      googlePlaceId: 'ChIJotro',
      googleRating: 4.1,
      googleReviewCount: 10,
      matchedName: 'Farmacia Cruz Verde',
      photoUrls: [],
    }
    const { placeRepo, locationRepo, ratingProvider } = deps(makePlace(), result)
    const uc = new EnrichPlaceRatingUseCase(placeRepo, locationRepo, ratingProvider)
    const res = await uc.execute({ placeId: 'place_1' })
    expect(res.status).toBe('updated')
    if (res.status !== 'updated') return
    expect(res.nameMatch).toBe(false)
  })
})
