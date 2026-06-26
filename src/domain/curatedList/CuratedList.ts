import { Slug } from '@domain/shared/Slug'
import { CuratedRule, isRuleEmpty } from './CuratedRule'
import { CuratedListNameRequiredError } from './errors/CuratedListNameRequiredError'
import { CuratedListEmptyRuleError } from './errors/CuratedListEmptyRuleError'

// GUIDE = guía exhaustiva por categoría/comuna; OCCASION = lista por intención.
// Solo cambia copy/template, no el mecanismo (ambas son una regla guardada).
export type CuratedListKind = 'GUIDE' | 'OCCASION'

// Orden del resto de los lugares (después de los destacados). Reservado: hoy solo
// `score_desc` (reputación), igual que el explorar.
export type CuratedListSort = 'score_desc'

// Destacado: lugar fijado a mano que va ARRIBA del resultado de la regla, con su
// bajada editorial ("qué es / qué esperar"). El resto de los datos del lugar
// (foto/horario/metro/rating) se leen al vuelo, no se guardan acá.
export interface CuratedListPin {
  readonly placeId: string
  readonly blurb?: string
  readonly sortOrder: number
}

export interface CuratedListProps {
  readonly id: string
  readonly slug: Slug
  readonly name: string
  readonly kind: CuratedListKind
  readonly description?: string
  readonly intro?: string
  readonly coverImageUrl?: string
  readonly rule: CuratedRule
  readonly sort: CuratedListSort
  readonly isPublished: boolean
  readonly publishedAt?: Date
  readonly pins: ReadonlyArray<CuratedListPin>
  readonly createdAt: Date
  readonly updatedAt: Date
}

// Aggregate de la "lista inteligente": regla guardada + chrome editorial + destacados.
// No carga los lugares de la regla (eso lo resuelve la aplicación contra SearchService
// al leer la landing). Mantiene los invariantes: nombre, regla no vacía, destacados
// ordenados sin duplicados.
export class CuratedList {
  readonly id: string
  readonly slug: Slug
  readonly name: string
  readonly kind: CuratedListKind
  readonly description?: string
  readonly intro?: string
  readonly coverImageUrl?: string
  readonly rule: CuratedRule
  readonly sort: CuratedListSort
  readonly isPublished: boolean
  readonly publishedAt?: Date
  readonly pins: ReadonlyArray<CuratedListPin>
  readonly createdAt: Date
  readonly updatedAt: Date

  private constructor(props: CuratedListProps) {
    this.id = props.id
    this.slug = props.slug
    this.name = props.name
    this.kind = props.kind
    this.description = props.description
    this.intro = props.intro
    this.coverImageUrl = props.coverImageUrl
    this.rule = props.rule
    this.sort = props.sort
    this.isPublished = props.isPublished
    this.publishedAt = props.publishedAt
    this.pins = props.pins
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  // Valida los invariantes al construir: lo usan tanto la carga desde BD como la
  // creación, así una lista mal formada nunca existe como objeto de dominio.
  static create(props: CuratedListProps): CuratedList {
    if (props.name.trim().length === 0) throw new CuratedListNameRequiredError()
    if (isRuleEmpty(props.rule)) throw new CuratedListEmptyRuleError()
    return new CuratedList({
      ...props,
      // Normaliza los destacados: dedup por placeId (gana el primero) + sortOrder denso.
      pins: dedupePins(props.pins),
    })
  }

  // Ids de los destacados, en orden, para excluirlos del resto al resolver la regla.
  pinnedPlaceIds(): string[] {
    return [...this.pins]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((p) => p.placeId)
  }
}

function dedupePins(pins: ReadonlyArray<CuratedListPin>): CuratedListPin[] {
  const seen = new Set<string>()
  return [...pins]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .filter((p) => {
      if (seen.has(p.placeId)) return false
      seen.add(p.placeId)
      return true
    })
    .map((p, i) => ({ placeId: p.placeId, blurb: p.blurb, sortOrder: i }))
}
