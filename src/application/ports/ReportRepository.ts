import { ReportReason } from '@domain/report/ReportReason'
import { ReportStatus } from '@domain/report/ReportStatus'

export interface NewReport {
  placeId: string
  userId?: string // el visitante también puede reportar
  reason: ReportReason
  message?: string
}

// Fila del buzón de admin: el reporte con el lugar al que apunta y quién lo mandó.
export interface ReportAdminRow {
  id: string
  placeId: string
  placeName: string
  placeSlug: string
  reason: ReportReason
  message: string | null
  status: ReportStatus
  reporterEmail: string | null // email del usuario logueado; null si fue anónimo
  createdAt: Date
}

export interface ReportRepository {
  create(report: NewReport): Promise<void>
  /** Buzón de admin: todos los reportes con su lugar, recientes primero. */
  listForAdmin(): Promise<ReportAdminRow[]>
  /** Cambia el estado de un reporte (resolver / descartar / reabrir). */
  setStatus(reportId: string, status: ReportStatus): Promise<void>
}
