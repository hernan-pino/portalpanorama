import { describe, expect, it, vi } from 'vitest'
import { HasBusinessAccessUseCase } from './HasBusinessAccessUseCase'
import { PlaceRepository } from '../ports/PlaceRepository'
import { BusinessClaimRepository } from '../ports/BusinessClaimRepository'

function useCase(managed: number, pending: number) {
  const placeRepo = { countManagedByUser: vi.fn(async () => managed) } as unknown as PlaceRepository
  const claimRepo = {
    countPendingByClaimant: vi.fn(async () => pending),
  } as unknown as BusinessClaimRepository
  return new HasBusinessAccessUseCase(placeRepo, claimRepo)
}

describe('HasBusinessAccessUseCase', () => {
  it('abre el panel a quien gestiona una ficha', async () => {
    await expect(useCase(1, 0).execute('user-1')).resolves.toBe(true)
  })

  it('abre el panel a quien tiene una solicitud en curso, aunque no gestione nada', async () => {
    // El caso del dueño que acaba de mandar su negocio: la ficha todavía no es suya
    // (se le asigna al aprobar el reclamo), pero necesita entrar a ver en qué va.
    await expect(useCase(0, 1).execute('user-1')).resolves.toBe(true)
  })

  it('no se lo ofrece a un usuario común', async () => {
    await expect(useCase(0, 0).execute('user-1')).resolves.toBe(false)
  })
})
