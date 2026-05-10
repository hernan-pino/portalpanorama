import { Listing } from '@domain/listing/Listing'
import { Neighborhood } from '@domain/shared/Neighborhoods'

export interface SearchParams {
  query?: string
  categoryId?: string
  categorySlug?: string
  neighborhood?: Neighborhood
  priceRanges?: number[]
  isPremium?: boolean
  page?: number
  limit?: number
}

export interface SearchResultItem {
  listingId: string
  name: string
  slug: string
  categoryId: string
  categoryName: string
  neighborhood: string
  description?: string
  priceRange?: number  // ordinal 1-4 ($/$$/$$$/$$$$), no es un monto CLP
  isPremium: boolean
  averageRating?: number
  reviewCount: number
  tags: string[]
}

export interface SearchResult {
  items: SearchResultItem[]
  total: number
  page: number
  totalPages: number
}

export interface SearchService {
  search(params: SearchParams): Promise<SearchResult>
  indexListing(listing: Listing): Promise<void>
  removeListing(listingId: string): Promise<void>
}
