export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface ListingClaimProps {
  readonly id: string
  readonly listingId: string
  readonly claimantId: string
  readonly status: ClaimStatus
  readonly message?: string
  readonly reviewNote?: string
  readonly createdAt: Date
  readonly resolvedAt?: Date
}

export class ListingClaim {
  readonly id: string
  readonly listingId: string
  readonly claimantId: string
  readonly status: ClaimStatus
  readonly message?: string
  readonly reviewNote?: string
  readonly createdAt: Date
  readonly resolvedAt?: Date

  private constructor(props: ListingClaimProps) {
    this.id = props.id
    this.listingId = props.listingId
    this.claimantId = props.claimantId
    this.status = props.status
    this.message = props.message
    this.reviewNote = props.reviewNote
    this.createdAt = props.createdAt
    this.resolvedAt = props.resolvedAt
  }

  static create(props: ListingClaimProps): ListingClaim {
    return new ListingClaim(props)
  }

  isPending(): boolean {
    return this.status === ClaimStatus.PENDING
  }

  approve(reviewNote?: string): ListingClaim {
    return new ListingClaim({
      ...this.toProps(),
      status: ClaimStatus.APPROVED,
      reviewNote,
      resolvedAt: new Date(),
    })
  }

  reject(reviewNote?: string): ListingClaim {
    return new ListingClaim({
      ...this.toProps(),
      status: ClaimStatus.REJECTED,
      reviewNote,
      resolvedAt: new Date(),
    })
  }

  private toProps(): ListingClaimProps {
    return {
      id: this.id,
      listingId: this.listingId,
      claimantId: this.claimantId,
      status: this.status,
      message: this.message,
      reviewNote: this.reviewNote,
      createdAt: this.createdAt,
      resolvedAt: this.resolvedAt,
    }
  }
}
