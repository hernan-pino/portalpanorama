import { SearchService, CategoryFacet } from '@application/ports/SearchService'

export class GetCategoryFacetsUseCase {
  constructor(private readonly searchService: SearchService) {}

  execute(): Promise<CategoryFacet[]> {
    return this.searchService.getCategoryFacets()
  }
}
