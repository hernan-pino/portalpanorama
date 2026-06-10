import { CollectionRepository, CuratedCollectionView } from '../ports/CollectionRepository'

// Landing SEO de una lista curada ("mejores X de Y"). Reusa la misma infra de
// colecciones (decisión: listas de usuario Y curadas = una entidad).
export class GetCuratedCollectionUseCase {
  constructor(private readonly collectionRepo: CollectionRepository) {}

  execute(slug: string): Promise<CuratedCollectionView | null> {
    return this.collectionRepo.findCuratedBySlug(slug)
  }
}
