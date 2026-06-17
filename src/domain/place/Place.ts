import { Slug } from '@domain/shared/Slug'
import { TagLayer } from '@domain/catalog/TagLayer'
import { PlaceStatus } from './PlaceStatus'
import { PriceRange } from './PriceRange'
import { ReservationPolicy } from './ReservationPolicy'
import { RainPolicy } from './RainPolicy'
import { InvalidPlaceTransitionError } from './errors/InvalidPlaceTransitionError'
import { TagLimitExceededError } from './errors/TagLimitExceededError'
import { PlaceCycleError } from './errors/PlaceCycleError'

// Spot sin ficha (mirador, kiosco): contenido editorial que cuelga del Place. Solo
// se lista bajo "Qué hay en [X]"; no filtra, no tiene reseña ni link propio.
export interface PlacePoint {
  readonly id: string
  readonly name: string
  readonly description?: string
  readonly kind?: string
  readonly sortOrder: number
}

// Imagen de la galería. Storage propio (nunca base64/hotlink). `credit` = origen.
export interface PlaceImage {
  readonly id: string
  readonly url: string
  readonly alt?: string
  readonly credit?: string
  readonly isPrimary: boolean
  readonly sortOrder: number
}

// Red social extra (WhatsApp/Facebook/TikTok…). Instagram va aparte como campo
// propio (red principal). Informativo, sin invariantes de dominio (como paymentMethods).
export interface PlaceSocialLink {
  readonly network: string
  readonly url: string
}

// Tag ya resuelto (con su capa) para poder validar límites en el dominio.
export interface PlaceTagRef {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly layer: TagLayer
}

export interface PlaceProps {
  readonly id: string
  readonly slug: Slug
  readonly name: string
  readonly description?: string
  readonly menuUrl?: string

  // Categorización (2.2): principal + subcat obligatorias; secundaria opcional
  readonly categoryId: string
  readonly subcategoryId: string
  readonly secondaryCategoryId?: string
  readonly secondarySubcategoryId?: string

  // Ubicación
  readonly address?: string
  readonly communeId: string
  readonly neighborhoodId?: string
  readonly lat?: number
  readonly lng?: number
  readonly metroStationId?: string
  readonly accessDetail?: string
  readonly reference?: string
  readonly rainPolicy?: RainPolicy

  // Presupuesto / operacional
  readonly priceRange?: PriceRange
  readonly reservation?: ReservationPolicy
  readonly paymentMethods: ReadonlyArray<string>
  readonly schedule?: string

  // Contacto / redes
  readonly phone?: string
  readonly website?: string
  readonly instagram?: string
  readonly socialLinks: ReadonlyArray<PlaceSocialLink>

  // Reputación Google + score calculado (2.5)
  readonly googlePlaceId?: string
  readonly googleRating?: number
  readonly googleReviewCount?: number
  readonly score: number

  // Propiedad / estado (puertas baratas, 2.1)
  readonly isPremium: boolean
  readonly ownerId?: string
  readonly status: PlaceStatus

  // Contenedor padre-hijo (un solo padre). El anti-ciclo transitivo lo valida el
  // use case con el repo; aquí solo se prohíbe ser su propio padre.
  readonly parentId?: string

  readonly images: ReadonlyArray<PlaceImage>
  readonly points: ReadonlyArray<PlacePoint>
  readonly tags: ReadonlyArray<PlaceTagRef>

  readonly createdAt: Date
  readonly updatedAt: Date
}

export class Place {
  readonly id: string
  readonly slug: Slug
  readonly name: string
  readonly description?: string
  readonly menuUrl?: string
  readonly categoryId: string
  readonly subcategoryId: string
  readonly secondaryCategoryId?: string
  readonly secondarySubcategoryId?: string
  readonly address?: string
  readonly communeId: string
  readonly neighborhoodId?: string
  readonly lat?: number
  readonly lng?: number
  readonly metroStationId?: string
  readonly accessDetail?: string
  readonly reference?: string
  readonly rainPolicy?: RainPolicy
  readonly priceRange?: PriceRange
  readonly reservation?: ReservationPolicy
  readonly paymentMethods: ReadonlyArray<string>
  readonly schedule?: string
  readonly phone?: string
  readonly website?: string
  readonly instagram?: string
  readonly socialLinks: ReadonlyArray<PlaceSocialLink>
  readonly googlePlaceId?: string
  readonly googleRating?: number
  readonly googleReviewCount?: number
  readonly score: number
  readonly isPremium: boolean
  readonly ownerId?: string
  readonly status: PlaceStatus
  readonly parentId?: string
  readonly images: ReadonlyArray<PlaceImage>
  readonly points: ReadonlyArray<PlacePoint>
  readonly tags: ReadonlyArray<PlaceTagRef>
  readonly createdAt: Date
  readonly updatedAt: Date

  // Topes por capa (decisión 2026-06-14). Solo las capas subjetivas topean; las
  // objetivas (EXPERIENCE/SERVICE/SPECIFIC) no tienen tope duro ("más info = mejor").
  static readonly MAX_AUDIENCE_TAGS = 4
  static readonly MAX_OCCASION_TAGS = 3
  static readonly MAX_VIBE_TAGS = 3

  private constructor(props: PlaceProps) {
    this.id = props.id
    this.slug = props.slug
    this.name = props.name
    this.description = props.description
    this.menuUrl = props.menuUrl
    this.categoryId = props.categoryId
    this.subcategoryId = props.subcategoryId
    this.secondaryCategoryId = props.secondaryCategoryId
    this.secondarySubcategoryId = props.secondarySubcategoryId
    this.address = props.address
    this.communeId = props.communeId
    this.neighborhoodId = props.neighborhoodId
    this.lat = props.lat
    this.lng = props.lng
    this.metroStationId = props.metroStationId
    this.accessDetail = props.accessDetail
    this.reference = props.reference
    this.rainPolicy = props.rainPolicy
    this.priceRange = props.priceRange
    this.reservation = props.reservation
    this.paymentMethods = props.paymentMethods
    this.schedule = props.schedule
    this.phone = props.phone
    this.website = props.website
    this.instagram = props.instagram
    this.socialLinks = props.socialLinks
    this.googlePlaceId = props.googlePlaceId
    this.googleRating = props.googleRating
    this.googleReviewCount = props.googleReviewCount
    this.score = props.score
    this.isPremium = props.isPremium
    this.ownerId = props.ownerId
    this.status = props.status
    this.parentId = props.parentId
    this.images = props.images
    this.points = props.points
    this.tags = props.tags
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  // Valida los invariantes de tags al construir. Lo usan tanto la carga desde BD
  // como la creación: una ficha mal formada nunca existe como objeto de dominio.
  static create(props: PlaceProps): Place {
    Place.assertTagLimits(props.tags)
    Place.assertNotSelfParent(props)
    return new Place(props)
  }

  // Caso trivial del anti-ciclo: un lugar no puede ser su propio padre. El ciclo
  // transitivo (A→B→A) lo valida el use case, que sí puede recorrer ancestros.
  private static assertNotSelfParent(props: PlaceProps): void {
    if (props.parentId && props.parentId === props.id) {
      throw new PlaceCycleError()
    }
  }

  private static assertTagLimits(tags: ReadonlyArray<PlaceTagRef>): void {
    const audience = tags.filter((t) => t.layer === TagLayer.AUDIENCE).length
    if (audience > Place.MAX_AUDIENCE_TAGS) {
      throw new TagLimitExceededError(TagLayer.AUDIENCE, Place.MAX_AUDIENCE_TAGS)
    }
    const occasion = tags.filter((t) => t.layer === TagLayer.OCCASION).length
    if (occasion > Place.MAX_OCCASION_TAGS) {
      throw new TagLimitExceededError(TagLayer.OCCASION, Place.MAX_OCCASION_TAGS)
    }
    const vibe = tags.filter((t) => t.layer === TagLayer.VIBE).length
    if (vibe > Place.MAX_VIBE_TAGS) {
      throw new TagLimitExceededError(TagLayer.VIBE, Place.MAX_VIBE_TAGS)
    }
  }

  // Transición válida: PENDING_REVIEW | ARCHIVED → PUBLISHED
  publish(): Place {
    if (this.status === PlaceStatus.PUBLISHED) return this
    return new Place({ ...this.toProps(), status: PlaceStatus.PUBLISHED, updatedAt: new Date() })
  }

  // Transición válida: cualquier estado → ARCHIVED (reemplaza al borrado)
  archive(): Place {
    if (this.status === PlaceStatus.ARCHIVED) return this
    return new Place({ ...this.toProps(), status: PlaceStatus.ARCHIVED, updatedAt: new Date() })
  }

  // Vuelve a revisión (ej. tras un reporte de dato incorrecto)
  sendToReview(): Place {
    if (this.status === PlaceStatus.PENDING_REVIEW) return this
    if (this.status === PlaceStatus.ARCHIVED) {
      throw new InvalidPlaceTransitionError(this.status, PlaceStatus.PENDING_REVIEW)
    }
    return new Place({
      ...this.toProps(),
      status: PlaceStatus.PENDING_REVIEW,
      updatedAt: new Date(),
    })
  }

  // Recalcula la reputación (promedio bayesiano se computa en el use case con el
  // promedio global del catálogo; aquí solo se persiste el resultado).
  withScore(score: number): Place {
    return new Place({ ...this.toProps(), score, updatedAt: new Date() })
  }

  // Setea la reputación de Google (B.7) traída por un PlaceRatingProvider externo.
  // El `score` se recalcula aparte en el use case con el promedio global; acá solo
  // se persisten los datos crudos. No cambia el estado de la ficha.
  withReputation(rep: {
    googlePlaceId?: string
    googleRating?: number
    googleReviewCount?: number
  }): Place {
    return new Place({
      ...this.toProps(),
      googlePlaceId: rep.googlePlaceId ?? this.googlePlaceId,
      googleRating: rep.googleRating ?? this.googleRating,
      googleReviewCount: rep.googleReviewCount ?? this.googleReviewCount,
      updatedAt: new Date(),
    })
  }

  isPublished(): boolean {
    return this.status === PlaceStatus.PUBLISHED
  }

  primaryImage(): PlaceImage | undefined {
    return this.images.find((img) => img.isPrimary) ?? this.images[0]
  }

  private toProps(): PlaceProps {
    return {
      id: this.id,
      slug: this.slug,
      name: this.name,
      description: this.description,
      menuUrl: this.menuUrl,
      categoryId: this.categoryId,
      subcategoryId: this.subcategoryId,
      secondaryCategoryId: this.secondaryCategoryId,
      secondarySubcategoryId: this.secondarySubcategoryId,
      address: this.address,
      communeId: this.communeId,
      neighborhoodId: this.neighborhoodId,
      lat: this.lat,
      lng: this.lng,
      metroStationId: this.metroStationId,
      accessDetail: this.accessDetail,
      reference: this.reference,
      rainPolicy: this.rainPolicy,
      priceRange: this.priceRange,
      reservation: this.reservation,
      paymentMethods: this.paymentMethods,
      schedule: this.schedule,
      phone: this.phone,
      website: this.website,
      instagram: this.instagram,
      socialLinks: this.socialLinks,
      googlePlaceId: this.googlePlaceId,
      googleRating: this.googleRating,
      googleReviewCount: this.googleReviewCount,
      score: this.score,
      isPremium: this.isPremium,
      ownerId: this.ownerId,
      status: this.status,
      parentId: this.parentId,
      images: this.images,
      points: this.points,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
