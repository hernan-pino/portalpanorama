import { CuratedListKind, CuratedPinKind } from '@domain/curatedList/CuratedList'
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
  // Fijados a mano (destacados + menciones), en el orden en que deben aparecer
  // (índice = sortOrder). `pinKind` por defecto FEATURED si no viene.
  pins: { placeId: string; pinKind?: CuratedPinKind; blurb?: string }[]
  isPublished: boolean
}
