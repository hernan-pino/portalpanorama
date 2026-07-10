import { Score } from '@domain/place/Score'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceCycleError } from '@domain/place/errors/PlaceCycleError'
import { PlaceRepository } from '../ports/PlaceRepository'
import { TagRepository } from '../ports/TagRepository'
import { CategoryRepository } from '../ports/CategoryRepository'
import { PlaceWriteInput } from './PlaceWriteInput'
import { assemblePlace } from './assemblePlace'
import { assertCategoryConsistency } from './assertCategoryConsistency'

// Edición de una ficha por el admin. Preserva id/slug/estado/fecha de creación;
// recalcula el score con los nuevos valores de Google y el prior actual de su categoría.
export class UpdatePlaceUseCase {
  constructor(
    private readonly placeRepo: PlaceRepository,
    private readonly tagRepo: TagRepository,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(placeId: string, input: PlaceWriteInput): Promise<void> {
    const existing = await this.placeRepo.findById(placeId)
    if (!existing) throw new PlaceNotFoundError(placeId)

    // Anti-ciclo transitivo: el padre elegido no puede ser este lugar ni uno de
    // sus descendientes (sería un ciclo en el árbol de contenedores). El caso
    // trivial (ser su propio padre) lo cuida el dominio; aquí el transitivo.
    if (input.parentId) {
      if (input.parentId === placeId) throw new PlaceCycleError()
      const ancestors = await this.placeRepo.findAncestorIds(input.parentId)
      if (ancestors.includes(placeId)) throw new PlaceCycleError()
    }

    const [tags, globalAverage, categoryStats, categories] = await Promise.all([
      this.tagRepo.findByIds(input.tagIds),
      this.placeRepo.globalAverageRating(),
      this.placeRepo.categoryRatingStats(),
      this.categoryRepo.listForForm(),
    ])

    assertCategoryConsistency(input, categories)

    const prior = Score.prior(
      categoryStats.find((s) => s.categoryId === input.categoryId),
      globalAverage,
    )
    const score = Score.bayesian(input.googleRating, input.googleReviewCount, prior)

    const updated = assemblePlace({
      id: existing.id,
      slug: existing.slug,
      input,
      score,
      tags,
      status: existing.status,
      createdAt: existing.createdAt,
    })

    await this.placeRepo.save(updated)
  }
}
