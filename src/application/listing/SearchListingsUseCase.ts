import { SearchParams, SearchResult, SearchService } from '../ports/SearchService'

export class SearchListingsUseCase {
  constructor(private readonly searchService: SearchService) {}

  async execute(params: SearchParams): Promise<SearchResult> {
    return this.searchService.search(params)
  }
}
