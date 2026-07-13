import { CategoryOption, CategoryRepository } from '../ports/CategoryRepository'
import { CommuneOption, LocationRepository } from '../ports/LocationRepository'

// Lo único que el form-semilla del dueño necesita para sus selectores. A diferencia
// del form de admin (GetPlaceFormOptions), NO trae tags/marcas/padres: el dueño no
// los elige — eso lo decide el admin al optimizar la ficha.
export interface SeedFormOptions {
  categories: CategoryOption[]
  communes: CommuneOption[]
}

export class GetSeedFormOptionsUseCase {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly locationRepo: LocationRepository,
  ) {}

  async execute(): Promise<SeedFormOptions> {
    const [categories, communes] = await Promise.all([
      this.categoryRepo.listForForm(),
      this.locationRepo.listCommunes(),
    ])
    return { categories, communes }
  }
}
