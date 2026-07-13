import { describe, expect, it, vi } from 'vitest'
import { CreateBusinessClaimUseCase, CreateBusinessClaimInput } from './CreateBusinessClaimUseCase'
import { BusinessClaimRepository } from '../ports/BusinessClaimRepository'
import { EmailService } from '../ports/EmailService'
import { DuplicateClaimError } from '@domain/business/errors/DuplicateClaimError'
import { TargetAlreadyOwnedError } from '@domain/business/errors/TargetAlreadyOwnedError'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'

function makeRepo(overrides: Partial<BusinessClaimRepository> = {}): BusinessClaimRepository {
  return {
    create: vi.fn(async () => {}),
    findById: vi.fn(async () => null),
    hasPending: vi.fn(async () => false),
    targetState: vi.fn(async () => 'FREE' as const),
    listForAdmin: vi.fn(async () => []),
    findPendingByClaimant: vi.fn(async () => []),
    countPending: vi.fn(async () => 0),
    persistApproval: vi.fn(async () => {}),
    persistRejection: vi.fn(async () => {}),
    notificationContext: vi.fn(async () => null),
    ...overrides,
  }
}

const emailService: EmailService = {
  sendWelcome: vi.fn(async () => {}),
  sendPasswordReset: vi.fn(async () => {}),
  sendClaimReceived: vi.fn(async () => {}),
  sendClaimApproved: vi.fn(async () => {}),
  sendClaimRejected: vi.fn(async () => {}),
}

function input(overrides: Partial<CreateBusinessClaimInput> = {}): CreateBusinessClaimInput {
  return {
    claimantId: 'user-1',
    claimantName: 'Hernán',
    claimantEmail: 'hernan@example.com',
    placeId: 'place-1',
    targetName: 'Ramen Kintaro',
    ...overrides,
  }
}

describe('CreateBusinessClaimUseCase', () => {
  it('crea el reclamo y manda el correo de confirmación', async () => {
    const repo = makeRepo()
    await new CreateBusinessClaimUseCase(repo, emailService).execute(input())
    expect(repo.create).toHaveBeenCalledOnce()
    expect(emailService.sendClaimReceived).toHaveBeenCalledWith(
      'hernan@example.com',
      'Hernán',
      'Ramen Kintaro',
    )
  })

  it('rechaza el reclamo si la ficha ya tiene dueño verificado', async () => {
    const repo = makeRepo({ targetState: vi.fn(async () => 'OWNED' as const) })
    await expect(
      new CreateBusinessClaimUseCase(repo, emailService).execute(input()),
    ).rejects.toThrow(TargetAlreadyOwnedError)
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('rechaza el reclamo si el objetivo no existe', async () => {
    const repo = makeRepo({ targetState: vi.fn(async () => 'MISSING' as const) })
    await expect(
      new CreateBusinessClaimUseCase(repo, emailService).execute(input()),
    ).rejects.toThrow(PlaceNotFoundError)
  })

  it('no duplica: un reclamo pendiente del mismo usuario sobre el mismo objetivo bloquea', async () => {
    const repo = makeRepo({ hasPending: vi.fn(async () => true) })
    await expect(
      new CreateBusinessClaimUseCase(repo, emailService).execute(input()),
    ).rejects.toThrow(DuplicateClaimError)
    expect(repo.create).not.toHaveBeenCalled()
  })

  it('si el correo falla, el reclamo igual queda creado', async () => {
    const repo = makeRepo()
    const failingEmail = { ...emailService, sendClaimReceived: vi.fn(async () => { throw new Error('resend caído') }) }
    await expect(
      new CreateBusinessClaimUseCase(repo, failingEmail).execute(input()),
    ).resolves.toBeUndefined()
    expect(repo.create).toHaveBeenCalledOnce()
  })
})
