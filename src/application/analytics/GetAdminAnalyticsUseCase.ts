import type {
  AnalyticsReport,
  AnalyticsReportService,
} from '@application/ports/AnalyticsReportService'

export interface GetAdminAnalyticsInput {
  rangeDays: number
}

export type GetAdminAnalyticsResult =
  | { configured: false }
  | { configured: true; report: AnalyticsReport }
  | { configured: true; error: string }

/**
 * Trae el reporte de audiencia para el panel de admin, filtrado a Chile (el único
 * tráfico que importa para el negocio; el resto es ruido de bots/VPN). Degrada con
 * gracia: si falta configuración devuelve `configured: false`, y si la API falla
 * devuelve un `error` legible en vez de tumbar la página.
 */
export class GetAdminAnalyticsUseCase {
  constructor(private readonly analytics: AnalyticsReportService) {}

  async execute(input: GetAdminAnalyticsInput): Promise<GetAdminAnalyticsResult> {
    if (!this.analytics.isConfigured()) {
      return { configured: false }
    }
    try {
      const report = await this.analytics.getReport({
        rangeDays: input.rangeDays,
        country: 'Chile',
      })
      return { configured: true, report }
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Error desconocido al consultar analítica.'
      return { configured: true, error }
    }
  }
}
