import { DomainError } from '@domain/shared/DomainError'

export class ReviewAlreadyRespondedError extends DomainError {
  readonly code = 'REVIEW_ALREADY_RESPONDED'
  constructor(reviewId: string) {
    super(`La review "${reviewId}" ya tiene una respuesta del dueño`)
  }
}

export interface ReviewProps {
  readonly id: string
  readonly listingId: string
  readonly userId: string
  readonly rating: number // 1-10, validado con Zod en presentation
  readonly body: string
  readonly response?: string
  readonly createdAt: Date
}

export class Review {
  readonly id: string
  readonly listingId: string
  readonly userId: string
  readonly rating: number
  readonly body: string
  readonly response?: string
  readonly createdAt: Date

  private constructor(props: ReviewProps) {
    this.id = props.id
    this.listingId = props.listingId
    this.userId = props.userId
    this.rating = props.rating
    this.body = props.body
    this.response = props.response
    this.createdAt = props.createdAt
  }

  static create(props: ReviewProps): Review {
    return new Review(props)
  }

  respond(responseText: string): Review {
    if (this.response !== undefined) throw new ReviewAlreadyRespondedError(this.id)
    return new Review({
      id: this.id,
      listingId: this.listingId,
      userId: this.userId,
      rating: this.rating,
      body: this.body,
      response: responseText,
      createdAt: this.createdAt,
    })
  }

  hasResponse(): boolean {
    return this.response !== undefined
  }
}
