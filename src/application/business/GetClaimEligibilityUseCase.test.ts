import { describe, expect, it, vi } from 'vitest'
import { GetClaimEligibilityUseCase } from './GetClaimEligibilityUseCase'
import { BusinessClaimRepository } from '../ports/BusinessClaimRepository'

function makeRepo(overrides: Partial<BusinessClaimRepository> = {}): BusinessClaimRepository {
  return {
    create: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    hasPending: vi.fn(async () => false),
    targetState: vi.fn(async () => 'FREE' as const),
    targetOwnership: vi.fn(async () => ({ ownerId: null })),
    listForAdmin: vi.fn(async () => []),
    findPendingByClaimant: vi.fn(async () => []),
    countPendingByClaimant: vi.fn(async () => 0),
    countPending: vi.fn(async () => 0),
    persistApproval: vi.fn(async () => {}),
    persistRejection: vi.fn(async () => {}),
    notificationContext: vi.fn(async () => null),
    ...overrides,
  }
}

const target = { claimantId: 'user-1', placeId: 'place-1' }

describe('GetClaimEligibilityUseCase', () => {
  it('una ficha sin dueño y sin solicitud previa se puede reclamar', async () => {
    const useCase = new GetClaimEligibilityUseCase(makeRepo())
    expect(await useCase.execute(target)).toBe('FREE')
  })

  it('no ofrece reclamar al que ya es dueño: lo manda a su panel', async () => {
    const repo = makeRepo({ targetOwnership: vi.fn(async () => ({ ownerId: 'user-1' })) })
    const useCase = new GetClaimEligibilityUseCase(repo)
    expect(await useCase.execute(target)).toBe('OWNED_BY_YOU')
  })

  it('una ficha con dueño verificado no la puede reclamar otro', async () => {
    const repo = makeRepo({ targetOwnership: vi.fn(async () => ({ ownerId: 'otro' })) })
    const useCase = new GetClaimEligibilityUseCase(repo)
    expect(await useCase.execute(target)).toBe('OWNED_BY_OTHER')
  })

  it('si ya mandó una solicitud, no le pide llenar el formulario de nuevo', async () => {
    const repo = makeRepo({ hasPending: vi.fn(async () => true) })
    const useCase = new GetClaimEligibilityUseCase(repo)
    expect(await useCase.execute(target)).toBe('PENDING_YOURS')
  })

  it('un objetivo que ya no existe no es reclamable', async () => {
    const repo = makeRepo({ targetOwnership: vi.fn(async () => null) })
    const useCase = new GetClaimEligibilityUseCase(repo)
    expect(await useCase.execute(target)).toBe('MISSING')
  })
})
