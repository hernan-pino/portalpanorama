export interface GoogleReviewDTO {
  id: string
  listingId: string
  authorName: string
  rating: number
  body: string
  publishedAt: Date
}

export interface GoogleReviewRepository {
  findByListingId(listingId: string): Promise<GoogleReviewDTO[]>
  upsertMany(
    listingId: string,
    reviews: Omit<GoogleReviewDTO, 'id' | 'listingId'>[],
  ): Promise<void>
}
