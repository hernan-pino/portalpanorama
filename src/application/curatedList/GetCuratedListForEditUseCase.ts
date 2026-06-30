import { CuratedListKind, CuratedPinKind } from '@domain/curatedList/CuratedList'
import { CuratedRule } from '@domain/curatedList/CuratedRule'
import { CuratedListNotFoundError } from '@domain/curatedList/errors/CuratedListNotFoundError'
import { CuratedListRepository } from '../ports/CuratedListRepository'

// Read-model plano para precargar el form de edición. Espeja CuratedListWriteInput
// + id/slug de solo lectura. No es el agregado (presentation no lo muta).
export interface CuratedListEditView {
  id: string
  slug: string
  name: string
  kind: CuratedListKind
  description?: string
  intro?: string
  coverImageUrl?: string
  rule: CuratedRule
  pins: { placeId: string; pinKind: CuratedPinKind; blurb?: string }[]
  isPublished: boolean
}

export class GetCuratedListForEditUseCase {
  constructor(private readonly listRepo: CuratedListRepository) {}

  async execute(id: string): Promise<CuratedListEditView> {
    const list = await this.listRepo.findById(id)
    if (!list) throw new CuratedListNotFoundError(id)

    return {
      id: list.id,
      slug: list.slug.value,
      name: list.name,
      kind: list.kind,
      description: list.description,
      intro: list.intro,
      coverImageUrl: list.coverImageUrl,
      rule: list.rule,
      pins: [...list.pins]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((p) => ({ placeId: p.placeId, pinKind: p.kind, blurb: p.blurb })),
      isPublished: list.isPublished,
    }
  }
}
