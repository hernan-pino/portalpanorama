import { PriceRange } from '@domain/place/PriceRange'
import { ReservationPolicy } from '@domain/place/ReservationPolicy'
import { RainPolicy } from '@domain/place/RainPolicy'

// Imagen entrante (sin id; el use case lo genera). La URL ya es de storage propio
// (la subida ocurre en presentation/infra antes de llamar al use case).
export interface PlaceImageInput {
  url: string
  alt?: string
  credit?: string
  isPrimary: boolean
  sortOrder: number
}

// Spot sin ficha entrante (sin id; el use case lo genera).
export interface PlacePointInput {
  name: string
  description?: string
  kind?: string
  sortOrder: number
}

// Forma de escritura de un Place (admin). Comparte create y update; el form de
// presentation valida con Zod antes de llegar acá.
export interface PlaceWriteInput {
  name: string
  description?: string
  menuUrl?: string

  categoryId: string
  subcategoryId: string
  secondaryCategoryId?: string
  secondarySubcategoryId?: string

  address?: string
  communeId: string
  neighborhoodId?: string
  lat?: number
  lng?: number
  metroStationId?: string
  accessDetail?: string
  reference?: string
  rainPolicy?: RainPolicy

  priceRange?: PriceRange
  reservation?: ReservationPolicy
  paymentMethods: string[]
  schedule?: string

  phone?: string
  website?: string
  instagram?: string
  socialLinks: { network: string; url: string }[]

  googlePlaceId?: string
  googleRating?: number
  googleReviewCount?: number

  isPremium?: boolean
  ownerId?: string

  // Contenedor: id del Place padre (Parquemet) si este lugar cuelga de otro.
  parentId?: string

  tagIds: string[]
  images: PlaceImageInput[]
  points: PlacePointInput[]
}
