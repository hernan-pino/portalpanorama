import { Listing } from '@domain/listing/Listing'
import { Neighborhood } from '@domain/shared/Neighborhoods'

export interface SearchParams {
  query?: string
  categoryId?: string
  neighborhood?: Neighborhood
  page?: number
  limit?: number
}

export interface SearchResultItem {
  listingId: string
  name: string
  slug: string
  categoryId: string
  neighborhood: string
  averageRating?: number
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
