import { PlaceRepository } from '../ports/PlaceRepository'

export interface SitemapPlaceEntry {
  slug: string
  updatedAt: Date
}

// Entradas de lugares publicados para el sitemap.xml. La página `sitemap.ts` arma
// las URLs absolutas y agrega las rutas estáticas; acá solo se traen los datos.
export class GetSitemapEntriesUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  execute(): Promise<SitemapPlaceEntry[]> {
    return this.placeRepo.listPublishedForSitemap()
  }
}
