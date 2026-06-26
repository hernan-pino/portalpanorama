import { CuratedListRepository } from '../ports/CuratedListRepository'

// Slugs publicados + fecha de edición de las listas curadas, para el sitemap.xml.
// Espeja GetSitemapEntriesUseCase (lugares): la landing /lista/[slug] también es
// indexable y es la pata SEO del go-to-market.
export class ListCuratedListSitemapEntriesUseCase {
  constructor(private readonly listRepo: CuratedListRepository) {}

  execute(): Promise<{ slug: string; updatedAt: Date }[]> {
    return this.listRepo.listPublishedForSitemap()
  }
}
