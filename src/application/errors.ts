import { DomainError } from '@domain/shared/DomainError'

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED'
  constructor(message = 'No autorizado para realizar esta acción') {
    super(message)
  }
}

export class SubscriptionAlreadyExistsError extends DomainError {
  readonly code = 'SUBSCRIPTION_ALREADY_EXISTS'
  constructor(listingId: string) {
    super(`El listing "${listingId}" ya tiene una suscripción activa`)
  }
}

export class SubscriptionNotFoundError extends DomainError {
  readonly code = 'SUBSCRIPTION_NOT_FOUND'
  constructor(listingId: string) {
    super(`No se encontró suscripción activa para el listing "${listingId}"`)
  }
}
