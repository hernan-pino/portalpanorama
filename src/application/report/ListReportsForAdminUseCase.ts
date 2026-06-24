import { ReportAdminRow, ReportRepository } from '@application/ports/ReportRepository'

// Buzón de admin: lista todos los reportes "dato incorrecto / lugar cerrado".
export class ListReportsForAdminUseCase {
  constructor(private readonly reportRepo: ReportRepository) {}

  execute(): Promise<ReportAdminRow[]> {
    return this.reportRepo.listForAdmin()
  }
}
