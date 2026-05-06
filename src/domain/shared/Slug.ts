import { DomainError } from './DomainError'

export class InvalidSlugError extends DomainError {
  readonly code = 'INVALID_SLUG'
  constructor(raw: string) {
    super(`Slug inválido: "${raw}". Solo minúsculas, números y guiones.`)
  }
}

export class Slug {
  private readonly _value: string
  static readonly PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

  private constructor(value: string) {
    this._value = value
  }

  static generate(name: string): Slug {
    const slugified = name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // elimina diacríticos
      .toLowerCase()
      .replace(/ñ/g, 'n') // ñ no siempre se descompone en NFD
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    if (!slugified || !Slug.PATTERN.test(slugified)) throw new InvalidSlugError(name)
    return new Slug(slugified)
  }

  static fromExisting(value: string): Slug {
    if (!Slug.PATTERN.test(value)) throw new InvalidSlugError(value)
    return new Slug(value)
  }

  get value(): string {
    return this._value
  }

  equals(other: Slug): boolean {
    return this._value === other._value
  }

  toString(): string {
    return this._value
  }
}
