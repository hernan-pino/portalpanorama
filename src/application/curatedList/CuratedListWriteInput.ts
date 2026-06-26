import { CuratedListKind } from '@domain/curatedList/CuratedList'
import { CuratedRule } from '@domain/curatedList/CuratedRule'

// Forma de escritura de una lista curada (admin). Compartida por create y update;
// el form de presentation valida con Zod antes de llegar acá. La coverImageUrl ya
// viene rehospedada (como en Place/Brand). El orden de `pins` define el sortOrder.
export interface CuratedListWriteInput {
  name: string
  kind: CuratedListKind
  description?: string
  intro?: string
  coverImageUrl?: string
  rule: CuratedRule
  // Destacados, en el orden en que deben aparecer (índice = sortOrder).
  pins: { placeId: string; blurb?: string }[]
  isPublished: boolean
}
