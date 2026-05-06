export interface ClaimReceivedParams {
  claimantName: string
  listingName: string
  listingId: string
  message?: string
}

export interface EmailService {
  sendWelcome(to: string, name: string): Promise<void>
  sendClaimReceived(adminEmail: string, params: ClaimReceivedParams): Promise<void>
  sendClaimApproved(to: string, listingName: string): Promise<void>
  sendClaimRejected(to: string, listingName: string, reviewNote?: string): Promise<void>
  sendPaymentFailed(to: string, listingName: string): Promise<void>
  sendSubscriptionCancelled(to: string, listingName: string): Promise<void>
}
