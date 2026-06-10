import { createId } from '@paralleldrive/cuid2'
import { Slug } from '@domain/shared/Slug'
import { Score } from '@domain/place/Score'
import { PlaceStatus } from '@domain/place/PlaceStatus'
import { PlaceRepository } from '../ports/PlaceRepository'
import { TagRepository } from '../ports/TagRepository'
import { PlaceWriteInput } from './PlaceWriteInput'
import { assemblePlace } from './assemblePlace'

// Carga de una ficha por el admin. Nace PENDING_REVIEW. El score se computa con
// el promedio global actual (2.5); RecalculateScores lo re-bate al entrar carga.
export class CreatePlaceUseCase {
  constructor(
    private readonly placeRepo: PlaceRepository,
    private readonly tagRepo: TagRepository,
  ) {}

  async execute(input: PlaceWriteInput): Promise<{ placeId: string }> {
    const [tags, globalAverage] = await Promise.all([
      this.tagRepo.findByIds(input.tagIds),
      this.placeRepo.globalAverageRating(),
    ])

    const score = Score.bayesian(input.googleRating, input.googleReviewCount, globalAverage)

    const place = assemblePlace({
      id: createId(),
      slug: Slug.generate(input.name),
      input,
      score,
      tags,
      status: PlaceStatus.PENDING_REVIEW,
      createdAt: new Date(),
    })

    await this.placeRepo.save(place)
    return { placeId: place.id }
  }
}
