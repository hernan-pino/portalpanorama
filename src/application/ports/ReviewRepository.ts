import { Review } from '@domain/review/Review'

export interface ReviewStats {
  count: number
  averageRating: number
}

export interface ReviewRepository {
  findById(id: string): Promise<Review | null>
  findByListingId(listingId: string): Promise<Review[]>
  findByUserAndListing(userId: string, listingId: string): Promise<Review | null>
  getStats(listingId: string): Promise<ReviewStats>
  save(review: Review): Promise<void>
}
