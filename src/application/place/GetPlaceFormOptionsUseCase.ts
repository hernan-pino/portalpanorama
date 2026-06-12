import { CategoryOption, CategoryRepository } from '../ports/CategoryRepository'
import { TagOption, TagRepository } from '../ports/TagRepository'
import {
  CommuneOption,
  LocationRepository,
  MetroStationOption,
  NeighborhoodOption,
} from '../ports/LocationRepository'

// Todo el catálogo que el form de admin necesita para sus selectores, en una sola
// llamada. Cada dimensión sale de su repo (categorías/tags/geografía); el use case
// solo las compone para que la página pida una vez.
export interface PlaceFormOptions {
  categories: CategoryOption[]
  tags: TagOption[]
  communes: CommuneOption[]
  neighborhoods: NeighborhoodOption[]
  metroStations: MetroStationOption[]
}

export class GetPlaceFormOptionsUseCase {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly tagRepo: TagRepository,
    private readonly locationRepo: LocationRepository,
  ) {}

  async execute(): Promise<PlaceFormOptions> {
    const [categories, tags, communes, neighborhoods, metroStations] = await Promise.all([
      this.categoryRepo.listForForm(),
      this.tagRepo.listAll(),
      this.locationRepo.listCommunes(),
      this.locationRepo.listNeighborhoods(),
      this.locationRepo.listMetroStations(),
    ])
    return { categories, tags, communes, neighborhoods, metroStations }
  }
}
