import { Money } from '@domain/shared/Money'

export interface CreateSubscriptionParams {
  listingId: string
  flowPlanId: string
  pricePerMonth: Money
  returnUrl: string
}

export interface CreateSubscriptionResult {
  paymentUrl: string
}

export type WebhookEventType =
  | 'subscription.activated'
  | 'payment.failed'
  | 'subscription.cancelled'

export interface WebhookEvent {
  type: WebhookEventType
  flowSubId: string
  flowPlanId: string
  listingId: string
  pricePerMonth: Money
  currentPeriodEnd?: Date
}

export interface PaymentGateway {
  createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult>
  cancelSubscription(flowSubId: string): Promise<void>
  parseWebhookEvent(payload: unknown, signature: string, timestampHeader: string): Promise<WebhookEvent>
}
