import { CuratedList } from '@domain/curatedList/CuratedList'
import { CuratedListNotFoundError } from '@domain/curatedList/errors/CuratedListNotFoundError'
import { CuratedListRepository } from '../ports/CuratedListRepository'
import { CuratedListWriteInput } from './CuratedListWriteInput'

// Edición de una lista curada. Conserva el slug original (cambiarlo rompería la URL
// /lista/[slug] y su SEO) y la fecha de creación. `publishedAt` se fija la primera
// vez que se publica y se conserva mientras siga publicada (se limpia al despublicar).
export class UpdateCuratedListUseCase {
  constructor(private readonly listRepo: CuratedListRepository) {}

  async execute(id: string, input: CuratedListWriteInput): Promise<void> {
    const existing = await this.listRepo.findById(id)
    if (!existing) throw new CuratedListNotFoundError(id)

    const list = CuratedList.create({
      id: existing.id,
      slug: existing.slug,
      name: input.name,
      kind: input.kind,
      description: input.description,
      intro: input.intro,
      coverImageUrl: input.coverImageUrl,
      rule: input.rule,
      sort: existing.sort,
      isPublished: input.isPublished,
      publishedAt: input.isPublished ? (existing.publishedAt ?? new Date()) : undefined,
      pins: input.pins.map((p, i) => ({
        placeId: p.placeId,
        kind: p.pinKind ?? 'FEATURED',
        blurb: p.blurb,
        sortOrder: i,
      })),
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    })

    await this.listRepo.save(list)
  }
}
