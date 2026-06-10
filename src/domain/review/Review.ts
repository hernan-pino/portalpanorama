import { DomainError } from '@domain/shared/DomainError'
import { ReviewTarget } from './ReviewTarget'

// Reseña propia, polimórfica (2.4). Creada pero APAGADA en el MVP (la sección
// "Mis reseñas" existe vacía). Escala 1–5 alineada con Google.

export class ReviewAlreadyRespondedError extends DomainError {
  readonly code = 'REVIEW_ALREADY_RESPONDED'
  constructor(reviewId: string) {
    super(`La reseña "${reviewId}" ya tiene una respuesta del negocio`)
  }
}

export class InvalidRatingError extends DomainError {
  readonly code = 'INVALID_RATING'
  constructor(rating: number) {
    super(`Rating inválido: ${rating}. Debe ser un entero entre 1 y 5.`)
  }
}

export interface ReviewProps {
  readonly id: string
  readonly targetType: ReviewTarget
  readonly targetId: string
  readonly userId: string
  readonly rating: number // 1–5
  readonly body?: string
  readonly response?: string
  readonly createdAt: Date
}

export class Review {
  readonly id: string
  readonly targetType: ReviewTarget
  readonly targetId: string
  readonly userId: string
  readonly rating: number
  readonly body?: string
  readonly response?: string
  readonly createdAt: Date

  private constructor(props: ReviewProps) {
    this.id = props.id
    this.targetType = props.targetType
    this.targetId = props.targetId
    this.userId = props.userId
    this.rating = props.rating
    this.body = props.body
    this.response = props.response
    this.createdAt = props.createdAt
  }

  static create(props: ReviewProps): Review {
    if (!Number.isInteger(props.rating) || props.rating < 1 || props.rating > 5) {
      throw new InvalidRatingError(props.rating)
    }
    return new Review(props)
  }

  respond(responseText: string): Review {
    if (this.response !== undefined) throw new ReviewAlreadyRespondedError(this.id)
    return new Review({ ...this.toProps(), response: responseText })
  }

  hasResponse(): boolean {
    return this.response !== undefined
  }

  private toProps(): ReviewProps {
    return {
      id: this.id,
      targetType: this.targetType,
      targetId: this.targetId,
      userId: this.userId,
      rating: this.rating,
      body: this.body,
      response: this.response,
      createdAt: this.createdAt,
    }
  }
}
