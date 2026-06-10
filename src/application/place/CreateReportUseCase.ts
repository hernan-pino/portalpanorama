import { ReportReason } from '@domain/report/ReportReason'
import { ReportRepository } from '../ports/ReportRepository'

export interface CreateReportInput {
  placeId: string
  userId?: string // el visitante anónimo también puede reportar
  reason: ReportReason
  message?: string
}

// "Reportar dato incorrecto / lugar cerrado" (frescura colaborativa). Disponible
// para visitante y usuario (matriz de permisos).
export class CreateReportUseCase {
  constructor(private readonly reportRepo: ReportRepository) {}

  execute(input: CreateReportInput): Promise<void> {
    return this.reportRepo.create({
      placeId: input.placeId,
      userId: input.userId,
      reason: input.reason,
      message: input.message,
    })
  }
}
