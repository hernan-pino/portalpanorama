import { DomainError } from '@domain/shared/DomainError'

// Una sola entidad para listas privadas de usuario Y listas curadas públicas
// (entregable 2). `ownerId` null ⇒ curada (del admin), con `slug` para SEO.

export class UnauthorizedCollectionAccessError extends DomainError {
  readonly code = 'UNAUTHORIZED_COLLECTION_ACCESS'
  constructor(userId: string, collectionId: string) {
    super(`El usuario "${userId}" no es dueño de la colección "${collectionId}"`)
  }
}

export interface CollectionItem {
  readonly placeId: string
  readonly sortOrder: number
}

export interface CollectionProps {
  readonly id: string
  readonly name: string
  readonly ownerId?: string // null/undefined = curada (pública)
  readonly isCurated: boolean
  readonly slug?: string // solo curadas (landing SEO)
  readonly description?: string
  readonly items: ReadonlyArray<CollectionItem>
  readonly createdAt: Date
  readonly updatedAt: Date
}

export class Collection {
  // Lista por defecto que toda persona tiene para guardar en un toque. Se crea
  // perezosamente al primer guardado (ver SaveToDefaultCollectionUseCase) y el
  // selector la muestra preseleccionada. No es un tipo aparte: es una colección
  // normal con este nombre.
  static readonly DEFAULT_NAME = 'Favoritos'

  readonly id: string
  readonly name: string
  readonly ownerId?: string
  readonly isCurated: boolean
  readonly slug?: string
  readonly description?: string
  readonly items: ReadonlyArray<CollectionItem>
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: CollectionProps) {
    this.id = props.id
    this.name = props.name
    this.ownerId = props.ownerId
    this.isCurated = props.isCurated
    this.slug = props.slug
    this.description = props.description
    this.items = props.items
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: CollectionProps): Collection {
    return new Collection(props)
  }

  // Idempotente: si el lugar ya está, no lo duplica.
  addPlace(placeId: string): Collection {
    if (this.items.some((it) => it.placeId === placeId)) return this
    const sortOrder = this.items.reduce((max, it) => Math.max(max, it.sortOrder), -1) + 1
    return new Collection({
      ...this.toProps(),
      items: [...this.items, { placeId, sortOrder }],
      updatedAt: new Date(),
    })
  }

  removePlace(placeId: string): Collection {
    return new Collection({
      ...this.toProps(),
      items: this.items.filter((it) => it.placeId !== placeId),
      updatedAt: new Date(),
    })
  }

  rename(name: string): Collection {
    return new Collection({ ...this.toProps(), name, updatedAt: new Date() })
  }

  assertOwnership(userId: string): void {
    if (this.ownerId !== userId) {
      throw new UnauthorizedCollectionAccessError(userId, this.id)
    }
  }

  private toProps(): CollectionProps {
    return {
      id: this.id,
      name: this.name,
      ownerId: this.ownerId,
      isCurated: this.isCurated,
      slug: this.slug,
      description: this.description,
      items: this.items,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
