import { ReportReason } from '@domain/report/ReportReason'

export interface NewReport {
  placeId: string
  userId?: string // el visitante también puede reportar
  reason: ReportReason
  message?: string
}

export interface ReportRepository {
  create(report: NewReport): Promise<void>
}
