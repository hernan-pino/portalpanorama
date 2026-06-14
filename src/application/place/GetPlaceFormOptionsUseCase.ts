import { CategoryOption, CategoryRepository } from '../ports/CategoryRepository'
import { TagOption, TagRepository } from '../ports/TagRepository'
import { PlaceParentOption, PlaceRepository } from '../ports/PlaceRepository'
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
  // Lugares candidatos a "padre" (selector de contenedor). Incluye todos; el form
  // excluye el propio lugar en edición y el servidor rechaza ciclos transitivos.
  parents: PlaceParentOption[]
}

export class GetPlaceFormOptionsUseCase {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly tagRepo: TagRepository,
    private readonly locationRepo: LocationRepository,
    private readonly placeRepo: PlaceRepository,
  ) {}

  async execute(): Promise<PlaceFormOptions> {
    const [categories, tags, communes, neighborhoods, metroStations, parents] = await Promise.all([
      this.categoryRepo.listForForm(),
      this.tagRepo.listAll(),
      this.locationRepo.listCommunes(),
      this.locationRepo.listNeighborhoods(),
      this.locationRepo.listMetroStations(),
      this.placeRepo.listForParentOptions(),
    ])
    return { categories, tags, communes, neighborhoods, metroStations, parents }
  }
}
