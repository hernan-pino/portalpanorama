import { DomainError } from './DomainError'

export class InvalidRUTError extends DomainError {
  readonly code = 'INVALID_RUT'
  constructor(_raw: string) {
    super('El RUT ingresado no es válido. Formato esperado: 12.345.678-9')
  }
}

export class RUT {
  private readonly _value: string // formato normalizado: "12345678-9"

  private constructor(value: string) {
    this._value = value
  }

  static create(raw: string): RUT {
    const normalized = raw.replace(/\./g, '').replace(/\s/g, '').toUpperCase()
    if (!RUT.isValid(normalized)) throw new InvalidRUTError(raw)
    return new RUT(normalized)
  }

  private static isValid(normalized: string): boolean {
    const parts = normalized.split('-')
    if (parts.length !== 2) return false
    const [body, dv] = parts
    if (!/^\d+$/.test(body)) return false
    if (!/^[\dK]$/.test(dv)) return false
    return RUT.computeDv(parseInt(body, 10)) === dv
  }

  // Algoritmo módulo 11 estándar chileno
  private static computeDv(body: number): string {
    let sum = 0
    let multiplier = 2
    let n = body
    while (n > 0) {
      sum += (n % 10) * multiplier
      n = Math.floor(n / 10)
      multiplier = multiplier === 7 ? 2 : multiplier + 1
    }
    const remainder = 11 - (sum % 11)
    if (remainder === 11) return '0'
    if (remainder === 10) return 'K'
    return String(remainder)
  }

  get formatted(): string {
    const [body, dv] = this._value.split('-')
    return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv
  }

  get value(): string {
    return this._value
  }

  equals(other: RUT): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this.formatted
  }
}
