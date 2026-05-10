import { DomainError } from './DomainError'

export class InvalidMoneyError extends DomainError {
  readonly code = 'INVALID_MONEY'
  constructor(message: string) {
    super(message)
  }
}

export interface MoneyProps {
  readonly amount: number
  readonly currency: 'CLP'
}

export class Money {
  readonly amount: number
  readonly currency = 'CLP' as const

  private constructor(amount: number) {
    this.amount = amount
  }

  static create(amount: number): Money {
    if (!Number.isInteger(amount)) {
      throw new InvalidMoneyError(`Money debe ser entero CLP. Recibido: ${amount}`)
    }
    if (amount < 0) {
      throw new InvalidMoneyError(`Money no puede ser negativo. Recibido: ${amount}`)
    }
    return new Money(amount)
  }

  static zero(): Money {
    return new Money(0)
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount
  }

  toPlainObject(): MoneyProps {
    return { amount: this.amount, currency: this.currency }
  }
}
