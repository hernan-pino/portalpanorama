export interface CategoryView {
  id: string
  slug: string
  name: string
}

export interface CategoryRepository {
  findAll(): Promise<CategoryView[]>
}

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  execute(): Promise<CategoryView[]> {
    return this.categoryRepository.findAll()
  }
}
