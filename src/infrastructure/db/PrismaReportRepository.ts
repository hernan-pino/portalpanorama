import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import { NewReport, ReportAdminRow, ReportRepository } from '@application/ports/ReportRepository'
import { ReportReason } from '@domain/report/ReportReason'
import { ReportStatus } from '@domain/report/ReportStatus'

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

  async listForAdmin(): Promise<ReportAdminRow[]> {
    const rows = await this.prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        placeId: true,
        reason: true,
        message: true,
        status: true,
        createdAt: true,
        place: { select: { name: true, slug: true } },
        user: { select: { email: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      placeId: r.placeId,
      placeName: r.place.name,
      placeSlug: r.place.slug,
      reason: r.reason as ReportReason,
      message: r.message,
      status: r.status as ReportStatus,
      reporterEmail: r.user?.email ?? null,
      createdAt: r.createdAt,
    }))
  }

  async setStatus(reportId: string, status: ReportStatus): Promise<void> {
    await this.prisma.report.update({
      where: { id: reportId },
      data: { status, resolvedAt: status === ReportStatus.OPEN ? null : new Date() },
    })
  }
}
