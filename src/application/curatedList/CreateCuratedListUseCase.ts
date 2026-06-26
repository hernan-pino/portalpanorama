import { createId } from '@paralleldrive/cuid2'
import { CuratedList } from '@domain/curatedList/CuratedList'
import { Slug } from '@domain/shared/Slug'
import { CuratedListRepository } from '../ports/CuratedListRepository'
import { CuratedListWriteInput } from './CuratedListWriteInput'

// Alta de una lista curada por el admin. El slug se deriva del nombre; la unicidad
// la garantiza la BD (@unique). CuratedList.create valida nombre + regla no vacía.
export class CreateCuratedListUseCase {
  constructor(private readonly listRepo: CuratedListRepository) {}

  async execute(input: CuratedListWriteInput): Promise<{ listId: string }> {
    const now = new Date()
    const list = CuratedList.create({
      id: createId(),
      slug: Slug.generate(input.name),
      name: input.name,
      kind: input.kind,
      description: input.description,
      intro: input.intro,
      coverImageUrl: input.coverImageUrl,
      rule: input.rule,
      sort: 'score_desc',
      isPublished: input.isPublished,
      publishedAt: input.isPublished ? now : undefined,
      pins: input.pins.map((p, i) => ({ placeId: p.placeId, blurb: p.blurb, sortOrder: i })),
      createdAt: now,
      updatedAt: now,
    })

    await this.listRepo.save(list)
    return { listId: list.id }
  }
}
