import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceRepository } from '../ports/PlaceRepository'

// Read-model para precargar el form de edición del admin. Espeja PlaceWriteInput
// (ids de FK + ids de tag + imágenes) más el id/slug/estado de solo lectura. No
// es el agregado de dominio: es un DTO plano, así presentation no lo muta.
export interface PlaceEditView {
  id: string
  slug: string
  status: string

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
  rainPolicy?: string

  priceRange?: string
  reservation?: string
  paymentMethods: string[]
  schedule?: string

  phone?: string
  website?: string
  instagram?: string
  socialLinks: { network: string; url: string }[]

  googlePlaceId?: string
  googleRating?: number
  googleReviewCount?: number

  isPremium: boolean

  parentId?: string

  tagIds: string[]
  images: { url: string; alt?: string; credit?: string; isPrimary: boolean; sortOrder: number }[]
  points: { name: string; description?: string; kind?: string; sortOrder: number }[]
}

// Carga el agregado y lo aplana al DTO del form. Lanza si no existe (la ruta
// /admin/lugares/[id] → notFound()).
export class GetPlaceForEditUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(id: string): Promise<PlaceEditView> {
    const place = await this.placeRepo.findById(id)
    if (!place) throw new PlaceNotFoundError(id)

    return {
      id: place.id,
      slug: place.slug.value,
      status: place.status,
      name: place.name,
      description: place.description,
      menuUrl: place.menuUrl,
      categoryId: place.categoryId,
      subcategoryId: place.subcategoryId,
      secondaryCategoryId: place.secondaryCategoryId,
      secondarySubcategoryId: place.secondarySubcategoryId,
      address: place.address,
      communeId: place.communeId,
      neighborhoodId: place.neighborhoodId,
      lat: place.lat,
      lng: place.lng,
      metroStationId: place.metroStationId,
      accessDetail: place.accessDetail,
      reference: place.reference,
      rainPolicy: place.rainPolicy,
      priceRange: place.priceRange,
      reservation: place.reservation,
      paymentMethods: [...place.paymentMethods],
      schedule: place.schedule,
      phone: place.phone,
      website: place.website,
      instagram: place.instagram,
      socialLinks: place.socialLinks.map((s) => ({ network: s.network, url: s.url })),
      googlePlaceId: place.googlePlaceId,
      googleRating: place.googleRating,
      googleReviewCount: place.googleReviewCount,
      isPremium: place.isPremium,
      parentId: place.parentId,
      tagIds: place.tags.map((t) => t.id),
      images: place.images.map((img) => ({
        url: img.url,
        alt: img.alt,
        credit: img.credit,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      })),
      points: place.points.map((pt) => ({
        name: pt.name,
        description: pt.description,
        kind: pt.kind,
        sortOrder: pt.sortOrder,
      })),
    }
  }
}
