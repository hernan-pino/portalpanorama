import { createId } from '@paralleldrive/cuid2'
import { Place, PlaceTagRef } from '@domain/place/Place'
import { PlaceStatus } from '@domain/place/PlaceStatus'
import { Slug } from '@domain/shared/Slug'
import { PlaceWriteInput } from './PlaceWriteInput'

// Ensambla un Place de dominio desde el input de escritura + las piezas ya
// resueltas (slug, score, tags con capa). Compartido por create y update para no
// repetir el mapeo de ~30 campos. Place.create valida los invariantes de tags.
export function assemblePlace(params: {
  id: string
  slug: Slug
  input: PlaceWriteInput
  score: number
  tags: PlaceTagRef[]
  status: PlaceStatus
  createdAt: Date
}): Place {
  const { input } = params
  return Place.create({
    id: params.id,
    slug: params.slug,
    name: input.name,
    description: input.description,
    menuUrl: input.menuUrl,
    categoryId: input.categoryId,
    subcategoryId: input.subcategoryId,
    secondaryCategoryId: input.secondaryCategoryId,
    secondarySubcategoryId: input.secondarySubcategoryId,
    address: input.address,
    communeId: input.communeId,
    neighborhoodId: input.neighborhoodId,
    lat: input.lat,
    lng: input.lng,
    metroStationId: input.metroStationId,
    accessDetail: input.accessDetail,
    reference: input.reference,
    rainPolicy: input.rainPolicy,
    priceRange: input.priceRange,
    reservation: input.reservation,
    paymentMethods: input.paymentMethods,
    schedule: input.schedule,
    phone: input.phone,
    website: input.website,
    instagram: input.instagram,
    socialLinks: input.socialLinks,
    googlePlaceId: input.googlePlaceId,
    googleRating: input.googleRating,
    googleReviewCount: input.googleReviewCount,
    score: params.score,
    isPremium: input.isPremium ?? false,
    ownerId: input.ownerId,
    status: params.status,
    parentId: input.parentId,
    images: input.images.map((img) => ({
      id: createId(),
      url: img.url,
      alt: img.alt,
      credit: img.credit,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
    points: input.points.map((pt) => ({
      id: createId(),
      name: pt.name,
      description: pt.description,
      kind: pt.kind,
      sortOrder: pt.sortOrder,
    })),
    tags: params.tags,
    createdAt: params.createdAt,
    updatedAt: new Date(),
  })
}
