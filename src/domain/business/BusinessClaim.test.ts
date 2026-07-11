import { describe, expect, it } from 'vitest'
import { BusinessClaim, BusinessClaimProps } from './BusinessClaim'
import { ClaimStatus } from './ClaimStatus'
import { InvalidClaimTargetError } from './errors/InvalidClaimTargetError'
import { InvalidClaimTransitionError } from './errors/InvalidClaimTransitionError'

// Factory mínima: reclamo pendiente sobre un Place.
function props(overrides: Partial<BusinessClaimProps> = {}): BusinessClaimProps {
  return {
    id: 'claim-1',
    claimantId: 'user-1',
    placeId: 'place-1',
    status: ClaimStatus.PENDING,
    createdAt: new Date('2026-07-10'),
    ...overrides,
  }
}

describe('BusinessClaim — objetivo del reclamo', () => {
  it('acepta un reclamo sobre un Place', () => {
    const claim = BusinessClaim.create(props())
    expect(claim.placeId).toBe('place-1')
    expect(claim.brandId).toBeUndefined()
  })

  it('acepta un reclamo sobre una Brand', () => {
    const claim = BusinessClaim.create(props({ placeId: undefined, brandId: 'brand-1' }))
    expect(claim.brandId).toBe('brand-1')
  })

  it('rechaza un reclamo sin objetivo', () => {
    expect(() => BusinessClaim.create(props({ placeId: undefined }))).toThrow(
      InvalidClaimTargetError,
    )
  })

  it('rechaza un reclamo con ambos objetivos a la vez', () => {
    expect(() => BusinessClaim.create(props({ brandId: 'brand-1' }))).toThrow(
      InvalidClaimTargetError,
    )
  })
})

describe('BusinessClaim — decisión del admin', () => {
  it('aprueba un reclamo pendiente registrando revisor y fecha', () => {
    const approved = BusinessClaim.create(props()).approve('admin-1', 'verificado por teléfono')
    expect(approved.status).toBe(ClaimStatus.APPROVED)
    expect(approved.reviewedById).toBe('admin-1')
    expect(approved.reviewNotes).toBe('verificado por teléfono')
    expect(approved.reviewedAt).toBeInstanceOf(Date)
  })

  it('rechaza un reclamo pendiente con motivo', () => {
    const rejected = BusinessClaim.create(props()).reject('admin-1', 'sin evidencia suficiente')
    expect(rejected.status).toBe(ClaimStatus.REJECTED)
    expect(rejected.reviewNotes).toBe('sin evidencia suficiente')
  })

  it('no permite decidir dos veces (aprobado no se re-aprueba ni se rechaza)', () => {
    const approved = BusinessClaim.create(props()).approve('admin-1')
    expect(() => approved.approve('admin-2')).toThrow(InvalidClaimTransitionError)
    expect(() => approved.reject('admin-2')).toThrow(InvalidClaimTransitionError)
  })

  it('la decisión no muta el reclamo original (entidad inmutable)', () => {
    const claim = BusinessClaim.create(props())
    claim.approve('admin-1')
    expect(claim.status).toBe(ClaimStatus.PENDING)
  })
})
