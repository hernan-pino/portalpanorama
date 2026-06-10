import { VisitHistoryRepository } from '../ports/VisitHistoryRepository'

export interface RecordVisitInput {
  userId: string
  placeId: string
}

// Registra que el usuario visitó una ficha (combustible IA post-MVP). Se dispara
// al abrir el detalle de un lugar estando logueado.
export class RecordVisitUseCase {
  constructor(private readonly historyRepo: VisitHistoryRepository) {}

  execute(input: RecordVisitInput): Promise<void> {
    return this.historyRepo.record(input.userId, input.placeId)
  }
}
