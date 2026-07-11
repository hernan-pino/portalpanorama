import { ClaimStatus } from './ClaimStatus'
import { InvalidClaimTargetError } from './errors/InvalidClaimTargetError'
import { InvalidClaimTransitionError } from './errors/InvalidClaimTransitionError'

// Reclamo de propiedad sobre un Place (dueño de una sucursal) o una Brand (cadena).
// Invariantes: apunta a exactamente UN objetivo, y la decisión (aprobar/rechazar)
// solo se toma una vez, desde PENDING. Al aprobarse, el lado de escritura setea el
// ownerId del objetivo y crea el BusinessProfile (BUSINESS_ACCOUNTS_SPEC §3-§4).

export interface BusinessClaimProps {
  readonly id: string
  readonly claimantId: string
  readonly placeId?: string
  readonly brandId?: string
  readonly claimantRole?: string
  readonly message?: string
  readonly evidenceUrl?: string
  readonly contactPhone?: string
  readonly contactEmail?: string
  readonly status: ClaimStatus
  readonly reviewedById?: string
  readonly reviewNotes?: string
  readonly createdAt: Date
  readonly reviewedAt?: Date
}

export class BusinessClaim {
  readonly id: string
  readonly claimantId: string
  readonly placeId?: string
  readonly brandId?: string
  readonly claimantRole?: string
  readonly message?: string
  readonly evidenceUrl?: string
  readonly contactPhone?: string
  readonly contactEmail?: string
  readonly status: ClaimStatus
  readonly reviewedById?: string
  readonly reviewNotes?: string
  readonly createdAt: Date
  readonly reviewedAt?: Date

  private constructor(props: BusinessClaimProps) {
    this.id = props.id
    this.claimantId = props.claimantId
    this.placeId = props.placeId
    this.brandId = props.brandId
    this.claimantRole = props.claimantRole
    this.message = props.message
    this.evidenceUrl = props.evidenceUrl
    this.contactPhone = props.contactPhone
    this.contactEmail = props.contactEmail
    this.status = props.status
    this.reviewedById = props.reviewedById
    this.reviewNotes = props.reviewNotes
    this.createdAt = props.createdAt
    this.reviewedAt = props.reviewedAt
  }

  static create(props: BusinessClaimProps): BusinessClaim {
    const targets = [props.placeId, props.brandId].filter(Boolean).length
    if (targets !== 1) throw new InvalidClaimTargetError()
    return new BusinessClaim(props)
  }

  approve(reviewerId: string, notes?: string): BusinessClaim {
    return this.decide(ClaimStatus.APPROVED, reviewerId, notes)
  }

  reject(reviewerId: string, notes?: string): BusinessClaim {
    return this.decide(ClaimStatus.REJECTED, reviewerId, notes)
  }

  private decide(status: ClaimStatus, reviewerId: string, notes?: string): BusinessClaim {
    if (this.status !== ClaimStatus.PENDING) throw new InvalidClaimTransitionError(this.status)
    return new BusinessClaim({
      ...this.toProps(),
      status,
      reviewedById: reviewerId,
      reviewNotes: notes,
      reviewedAt: new Date(),
    })
  }

  private toProps(): BusinessClaimProps {
    return {
      id: this.id,
      claimantId: this.claimantId,
      placeId: this.placeId,
      brandId: this.brandId,
      claimantRole: this.claimantRole,
      message: this.message,
      evidenceUrl: this.evidenceUrl,
      contactPhone: this.contactPhone,
      contactEmail: this.contactEmail,
      status: this.status,
      reviewedById: this.reviewedById,
      reviewNotes: this.reviewNotes,
      createdAt: this.createdAt,
      reviewedAt: this.reviewedAt,
    }
  }
}
