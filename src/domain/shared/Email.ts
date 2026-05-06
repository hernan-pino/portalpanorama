import { DomainError } from './DomainError'

export class InvalidEmailError extends DomainError {
  readonly code = 'INVALID_EMAIL'
  constructor(raw: string) {
    super(`Email inválido: "${raw}"`)
  }
}

export class Email {
  private readonly _value: string
  private static readonly PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string): Email {
    const trimmed = raw.trim().toLowerCase()
    if (!Email.PATTERN.test(trimmed)) throw new InvalidEmailError(raw)
    return new Email(trimmed)
  }

  get value(): string {
    return this._value
  }

  equals(other: Email): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
