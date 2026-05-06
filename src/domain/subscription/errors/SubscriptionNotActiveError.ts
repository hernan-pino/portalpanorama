import { DomainError } from '@domain/shared/DomainError'

export class SubscriptionNotActiveError extends DomainError {
  readonly code = 'SUBSCRIPTION_NOT_ACTIVE'
  constructor(subscriptionId: string) {
    super(`La suscripción "${subscriptionId}" no está activa`)
  }
}
