import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import { NewReport, ReportRepository } from '@application/ports/ReportRepository'

export class PrismaReportRepository implements ReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // "Reportar dato incorrecto / lugar cerrado". El visitante anónimo también puede
  // reportar (userId opcional). Entra como OPEN; el admin lo resuelve.
  async create(report: NewReport): Promise<void> {
    await this.prisma.report.create({
      data: {
        id: createId(),
        placeId: report.placeId,
        userId: report.userId ?? null,
        reason: report.reason,
        message: report.message ?? null,
      },
    })
  }
}
