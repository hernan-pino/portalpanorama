export interface ListingStats {
  views: number
  clicks: number
}

export interface AnalyticsService {
  trackView(listingId: string): Promise<void>
  trackClick(listingId: string): Promise<void>
  getStats(listingId: string): Promise<ListingStats>
}
