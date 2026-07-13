import { describe, expect, it, vi } from 'vitest'
import { GetBusinessDashboardUseCase } from './GetBusinessDashboardUseCase'
import { OwnedPlaceRow, PlaceRepository } from '../ports/PlaceRepository'
import {
  EMPTY_CLICK_COUNTS,
  PlaceClickCounts,
  PlaceClickRepository,
} from '../ports/PlaceClickRepository'
import { BusinessClaimRepository, PendingClaimRow } from '../ports/BusinessClaimRepository'

function row(id: string, over: Partial<OwnedPlaceRow> = {}): OwnedPlaceRow {
  return {
    id,
    slug: id,
    name: `Local ${id}`,
    status: 'PUBLISHED',
    categoryName: 'Gastronomía',
    communeName: 'Providencia',
    visitCount: 0,
    saveCount: 0,
    imageCount: 0,
    hasDescription: false,
    hasSchedule: false,
    hasPhone: false,
    hasWebsite: false,
    hasInstagram: false,
    hasMenu: false,
    hasPrice: false,
    ...over,
  } as OwnedPlaceRow
}

function counts(over: Partial<PlaceClickCounts>): PlaceClickCounts {
  return { ...EMPTY_CLICK_COUNTS, ...over }
}

function useCase(
  rows: OwnedPlaceRow[],
  clicks: Map<string, PlaceClickCounts>,
  pending: PendingClaimRow[] = [],
) {
  const placeRepo = { findManagedByUser: vi.fn(async () => rows) } as unknown as PlaceRepository
  const clickRepo = { countsByPlaceIds: vi.fn(async () => clicks) } as unknown as PlaceClickRepository
  const claimRepo = {
    findPendingByClaimant: vi.fn(async () => pending),
  } as unknown as BusinessClaimRepository
  return { uc: new GetBusinessDashboardUseCase(placeRepo, clickRepo, claimRepo), clickRepo }
}

describe('GetBusinessDashboardUseCase — clics de contacto', () => {
  it('adosa los clics a cada ficha y suma el total del panel', async () => {
    const clicks = new Map([
      ['a', counts({ directions: 3, website: 2, total: 5 })],
      ['b', counts({ phone: 4, total: 4 })],
    ])
    const { uc } = useCase([row('a'), row('b')], clicks)

    const out = await uc.execute('user-1')

    expect(out.places[0].clicks.directions).toBe(3)
    expect(out.places[1].clicks.phone).toBe(4)
    expect(out.totals.clicks).toBe(9)
  })

  it('una ficha sin clics cae a cero (no rompe ni queda undefined)', async () => {
    const { uc } = useCase([row('a')], new Map())

    const out = await uc.execute('user-1')

    expect(out.places[0].clicks).toEqual(EMPTY_CLICK_COUNTS)
    expect(out.totals.clicks).toBe(0)
  })

  it('pide los conteos de TODAS las fichas gestionadas en una sola query', async () => {
    const { uc, clickRepo } = useCase([row('a'), row('b')], new Map())

    await uc.execute('user-1')

    expect(clickRepo.countsByPlaceIds).toHaveBeenCalledOnce()
    expect(clickRepo.countsByPlaceIds).toHaveBeenCalledWith(['a', 'b'])
  })
})

describe('GetBusinessDashboardUseCase — solicitudes en curso', () => {
  it('expone los reclamos PENDING del usuario aunque todavía no gestione ninguna ficha', async () => {
    const pending: PendingClaimRow[] = [
      { id: 'c1', targetName: 'Café Altura', targetType: 'PLACE', createdAt: new Date('2026-07-12') },
    ]
    const { uc } = useCase([], new Map(), pending)

    const out = await uc.execute('user-1')

    // La ficha recién enviada NO es suya hasta que el admin aprueba: no cuenta como
    // gestionada, pero el panel igual tiene que mostrar que está en camino.
    expect(out.places).toEqual([])
    expect(out.pendingClaims).toEqual([
      { id: 'c1', targetName: 'Café Altura', createdAt: new Date('2026-07-12') },
    ])
  })
})
