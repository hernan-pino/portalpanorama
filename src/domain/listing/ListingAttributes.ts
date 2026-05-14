export type GooglePlaceType =
  | 'bar'
  | 'gastropub'
  | 'restaurant'
  | 'food'
  | 'point_of_interest'
  | 'establishment'
  | 'pub'
  | 'night_club'
  | 'cafe'
  | 'museum'
  | 'park'
  | string

export interface ListingAttributes {
  tipos: GooglePlaceType[]
}

export function isListingAttributes(v: unknown): v is ListingAttributes {
  return (
    typeof v === 'object' &&
    v !== null &&
    'tipos' in v &&
    Array.isArray((v as { tipos: unknown }).tipos)
  )
}
