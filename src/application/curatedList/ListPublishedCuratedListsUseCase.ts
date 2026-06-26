import { CuratedListCardView, CuratedListRepository } from '../ports/CuratedListRepository'

// Listas curadas publicadas para la home (read-model liviano, sin resolver la regla).
export class ListPublishedCuratedListsUseCase {
  constructor(private readonly listRepo: CuratedListRepository) {}

  execute(): Promise<CuratedListCardView[]> {
    return this.listRepo.listPublished()
  }
}
