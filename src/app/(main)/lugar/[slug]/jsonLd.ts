import type { PlaceDetailView } from '@application/ports/PlaceRepository'
import { absoluteUrl } from '@lib/siteUrl'

// El bucket de precio mapea al campo libre `priceRange` de schema.org ($..$$$$).
const PRICE_RANGE_LD: Record<string, string> = {
  FREE: 'Gratis',
  UNDER_5000: '$',
  FROM_5000_TO_15000: '$$',
  FROM_15000_TO_30000: '$$$',
  OVER_30000: '$$$$',
}

function withProtocol(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`
}
function instagramHref(handle: string): string {
  if (/^https?:\/\//.test(handle)) return handle
  return `https://instagram.com/${handle.replace(/^@/, '')}`
}

// JSON-LD schema.org/LocalBusiness de la ficha: Google lo usa para rich results y
// los LLMs para entender el lugar (GEO/AEO). Solo se emiten los campos presentes.
export function placeJsonLd(place: PlaceDetailView): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: place.name,
    url: absoluteUrl(`/lugar/${place.slug}`),
  }

  if (place.description) ld.description = place.description
  if (place.images.length) ld.image = place.images.map((i) => i.url)
  if (place.phone) ld.telephone = place.phone
  if (place.priceRange && PRICE_RANGE_LD[place.priceRange]) {
    ld.priceRange = PRICE_RANGE_LD[place.priceRange]
  }
  if (place.menuUrl) ld.hasMenu = place.menuUrl

  // Dirección: addressLocality = comuna; país fijo Chile.
  ld.address = {
    '@type': 'PostalAddress',
    ...(place.address ? { streetAddress: place.address } : {}),
    addressLocality: place.commune.name,
    addressRegion: 'Región Metropolitana',
    addressCountry: 'CL',
  }

  if (place.lat != null && place.lng != null) {
    ld.geo = { '@type': 'GeoCoordinates', latitude: place.lat, longitude: place.lng }
  }

  // Reputación de Google (solo si hay reseñas), escala 1–5.
  if (place.googleRating != null && place.googleReviewCount != null && place.googleReviewCount > 0) {
    ld.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: place.googleRating,
      reviewCount: place.googleReviewCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  const sameAs: string[] = []
  if (place.website) sameAs.push(withProtocol(place.website))
  if (place.instagram) sameAs.push(instagramHref(place.instagram))
  for (const s of place.socialLinks) sameAs.push(withProtocol(s.url))
  if (sameAs.length) ld.sameAs = sameAs

  return ld
}
