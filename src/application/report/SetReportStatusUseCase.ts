import { ReportRepository } from '@application/ports/ReportRepository'
import { ReportStatus } from '@domain/report/ReportStatus'

// Admin marca un reporte como resuelto / descartado / reabierto.
export class SetReportStatusUseCase {
  constructor(private readonly reportRepo: ReportRepository) {}

  execute(reportId: string, status: ReportStatus): Promise<void> {
    return this.reportRepo.setStatus(reportId, status)
  }
}
