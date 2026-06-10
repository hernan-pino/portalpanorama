import { Score } from '@domain/place/Score'
import { PlaceRepository } from '../ports/PlaceRepository'

// Re-bate el score bayesiano de TODOS los lugares en batch (2.5). Se corre cuando
// entra carga nueva: el promedio global `C` cambia y arrastra todos los scores.
// No corre en runtime — es una operación de mantención del admin.
export class RecalculateScoresUseCase {
  constructor(private readonly placeRepo: PlaceRepository) {}

  async execute(): Promise<{ updated: number }> {
    const rows = await this.placeRepo.findRatingsForScoring()
    const globalAverage = await this.placeRepo.globalAverageRating()

    const scores = rows.map((row) => ({
      id: row.id,
      score: Score.bayesian(row.googleRating, row.googleReviewCount, globalAverage),
    }))

    await this.placeRepo.updateScores(scores)
    return { updated: scores.length }
  }
}
