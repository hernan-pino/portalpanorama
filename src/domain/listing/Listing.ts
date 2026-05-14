import { DomainError } from '@domain/shared/DomainError'
import { Money } from '@domain/shared/Money'
import { Neighborhood } from '@domain/shared/Neighborhoods'
import { Slug } from '@domain/shared/Slug'
import { UnauthorizedListingAccessError } from './errors/UnauthorizedListingAccessError'
import { ListingPlan } from './ListingPlan'
import { ListingStatus } from './ListingStatus'
import { TagStatus } from './TagStatus'

export class PhotoLimitExceededError extends DomainError {
  readonly code = 'PHOTO_LIMIT_EXCEEDED'
  constructor() {
    super('Los listings FREE tienen máximo 3 fotos. Actualiza a PREMIUM para agregar más.')
  }
}

export class InactiveTagError extends DomainError {
  readonly code = 'INACTIVE_TAG'
  constructor(tagId: string) {
    super(`El tag "${tagId}" no está activo y no puede asociarse a un listing`)
  }
}

export class InvalidListingTransitionError extends DomainError {
  readonly code = 'INVALID_LISTING_TRANSITION'
  constructor(from: ListingStatus, to: ListingStatus) {
    super(`Transición de estado inválida: ${from} → ${to}`)
  }
}

export interface ListingImage {
  readonly id: string
  readonly url: string
  readonly alt?: string
  readonly order: number
}

export interface ListingTag {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly status: TagStatus
}

export interface ListingProps {
  readonly id: string
  readonly slug: Slug
  readonly name: string
  readonly description?: string
  readonly plan: ListingPlan
  readonly status: ListingStatus
  readonly categoryId: string
  readonly neighborhood: Neighborhood
  readonly commune?: string
  readonly address?: string
  readonly phone?: string
  readonly website?: string
  readonly priceRange?: 1 | 2 | 3 | 4
  readonly ownerId: string
  readonly images: ReadonlyArray<ListingImage>
  readonly tags: ReadonlyArray<ListingTag>
  readonly pricePerMonth?: Money
  readonly googleRating?: number
  readonly googleReviewCount?: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export class Listing {
  readonly id: string
  readonly slug: Slug
  readonly name: string
  readonly description?: string
  readonly plan: ListingPlan
  readonly status: ListingStatus
  readonly categoryId: string
  readonly neighborhood: Neighborhood
  readonly commune?: string
  readonly address?: string
  readonly phone?: string
  readonly website?: string
  readonly priceRange?: 1 | 2 | 3 | 4
  readonly ownerId: string
  readonly images: ReadonlyArray<ListingImage>
  readonly tags: ReadonlyArray<ListingTag>
  readonly pricePerMonth?: Money
  readonly googleRating?: number
  readonly googleReviewCount?: number
  readonly createdAt: Date
  readonly updatedAt: Date

  private static readonly FREE_PHOTO_LIMIT = 3

  private constructor(props: ListingProps) {
    this.id = props.id
    this.slug = props.slug
    this.name = props.name
    this.description = props.description
    this.plan = props.plan
    this.status = props.status
    this.categoryId = props.categoryId
    this.neighborhood = props.neighborhood
    this.commune = props.commune
    this.address = props.address
    this.phone = props.phone
    this.website = props.website
    this.priceRange = props.priceRange
    this.ownerId = props.ownerId
    this.images = props.images
    this.tags = props.tags
    this.pricePerMonth = props.pricePerMonth
    this.googleRating = props.googleRating
    this.googleReviewCount = props.googleReviewCount
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: ListingProps): Listing {
    return new Listing(props)
  }

  // Regla de negocio: FREE máx 3 fotos, PREMIUM ilimitadas
  addImage(image: ListingImage): Listing {
    if (this.plan === ListingPlan.FREE && this.images.length >= Listing.FREE_PHOTO_LIMIT) {
      throw new PhotoLimitExceededError()
    }
    return new Listing({
      ...this.toProps(),
      images: [...this.images, image],
      updatedAt: new Date(),
    })
  }

  removeImage(imageId: string): Listing {
    return new Listing({
      ...this.toProps(),
      images: this.images.filter((img) => img.id !== imageId),
      updatedAt: new Date(),
    })
  }

  // Regla de negocio: solo se pueden agregar tags con status ACTIVE
  addTag(tag: ListingTag): Listing {
    if (tag.status !== TagStatus.ACTIVE) throw new InactiveTagError(tag.id)
    if (this.tags.some((t) => t.id === tag.id)) return this
    return new Listing({
      ...this.toProps(),
      tags: [...this.tags, tag],
      updatedAt: new Date(),
    })
  }

  removeTag(tagId: string): Listing {
    return new Listing({
      ...this.toProps(),
      tags: this.tags.filter((t) => t.id !== tagId),
      updatedAt: new Date(),
    })
  }

  // Transiciones válidas: DRAFT|SUSPENDED → PUBLISHED
  publish(): Listing {
    if (this.status !== ListingStatus.DRAFT && this.status !== ListingStatus.SUSPENDED) {
      throw new InvalidListingTransitionError(this.status, ListingStatus.PUBLISHED)
    }
    return new Listing({ ...this.toProps(), status: ListingStatus.PUBLISHED, updatedAt: new Date() })
  }

  // Transición válida: PUBLISHED → CLAIMED
  claim(): Listing {
    if (this.status !== ListingStatus.PUBLISHED) {
      throw new InvalidListingTransitionError(this.status, ListingStatus.CLAIMED)
    }
    return new Listing({ ...this.toProps(), status: ListingStatus.CLAIMED, updatedAt: new Date() })
  }

  // Transición válida: PUBLISHED|CLAIMED → SUSPENDED
  suspend(): Listing {
    if (this.status !== ListingStatus.PUBLISHED && this.status !== ListingStatus.CLAIMED) {
      throw new InvalidListingTransitionError(this.status, ListingStatus.SUSPENDED)
    }
    return new Listing({ ...this.toProps(), status: ListingStatus.SUSPENDED, updatedAt: new Date() })
  }

  upgradeToPremium(): Listing {
    return new Listing({ ...this.toProps(), plan: ListingPlan.PREMIUM, updatedAt: new Date() })
  }

  // Al bajar a FREE: truncar a 3 fotos si tenía más. El use case elimina el resto del storage.
  downgradeToFree(): Listing {
    const images =
      this.images.length > Listing.FREE_PHOTO_LIMIT
        ? this.images.slice(0, Listing.FREE_PHOTO_LIMIT)
        : this.images
    return new Listing({ ...this.toProps(), plan: ListingPlan.FREE, images, updatedAt: new Date() })
  }

  approveTag(tagId: string): Listing {
    const tags = this.tags.map((t) =>
      t.id === tagId ? { ...t, status: TagStatus.ACTIVE } : t,
    )
    return new Listing({ ...this.toProps(), tags, updatedAt: new Date() })
  }

  rejectTag(tagId: string): Listing {
    const tags = this.tags.map((t) =>
      t.id === tagId ? { ...t, status: TagStatus.REJECTED } : t,
    )
    return new Listing({ ...this.toProps(), tags, updatedAt: new Date() })
  }

  assertOwnership(userId: string): void {
    if (this.ownerId !== userId) throw new UnauthorizedListingAccessError(userId, this.id)
  }

  canAddImage(): boolean {
    return this.plan === ListingPlan.PREMIUM || this.images.length < Listing.FREE_PHOTO_LIMIT
  }

  isPremium(): boolean {
    return this.plan === ListingPlan.PREMIUM
  }

  isPublished(): boolean {
    return this.status === ListingStatus.PUBLISHED
  }

  private toProps(): ListingProps {
    return {
      id: this.id,
      slug: this.slug,
      name: this.name,
      description: this.description,
      plan: this.plan,
      status: this.status,
      categoryId: this.categoryId,
      neighborhood: this.neighborhood,
      commune: this.commune,
      address: this.address,
      phone: this.phone,
      website: this.website,
      priceRange: this.priceRange,
      ownerId: this.ownerId,
      images: this.images,
      tags: this.tags,
      pricePerMonth: this.pricePerMonth,
      googleRating: this.googleRating,
      googleReviewCount: this.googleReviewCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
