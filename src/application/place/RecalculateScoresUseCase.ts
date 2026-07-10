import { Score } from '@domain/place/Score'
import { PlaceRepository } from '../ports/PlaceRepository'

// Re-bate el score bayesiano de TODOS los lugares en batch (2.5). Se corre cuando
// entra carga nueva: los priores `C` (por categoría y global) cambian y arrastran
// todos los scores. No corre en runtime — es una operación de mantención del admin.
export class RecalculateScoresUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(): Promise<{ updated: number }> {
    const [rows, categoryStats, globalAverage] = await Promise.all([
      this.placeRepo.findRatingsForScoring(),
      this.placeRepo.categoryRatingStats(),
      this.placeRepo.globalAverageRating(),
    ])
    const statsByCategory = new Map(categoryStats.map((s) => [s.categoryId, s]))

    const scores = rows.map((row) => {
      const prior = Score.prior(statsByCategory.get(row.categoryId), globalAverage)
      return {
        id: row.id,
        score: Score.bayesian(row.googleRating, row.googleReviewCount, prior),
      }
    })

    await this.placeRepo.updateScores(scores)
    return { updated: scores.length }
  }
}
