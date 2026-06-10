import { CategoryRepository, CategoryView } from '../ports/CategoryRepository'

// Categorías activas para la home (fila de chips) y los filtros. En el MVP solo
// las que tienen lugares; las event-only quedan apagadas (las filtra el repo).
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  execute(): Promise<CategoryView[]> {
    return this.categoryRepo.findActive()
  }
}
