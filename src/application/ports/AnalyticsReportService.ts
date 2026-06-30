// Puerto de analítica de audiencia. La implementación concreta (Google Analytics
// Data API) vive en infrastructure/. La capa de aplicación solo conoce esta interfaz,
// nunca el SDK de Google. Todos los reportes se piden ya filtrados por país para
// excluir el ruido de bots/VPN de datacenter (ver AnalyticsQuery.country).

export interface AnalyticsQuery {
  /** Días hacia atrás desde hoy (ej. 7, 28, 90). */
  rangeDays: number
  /** País por el que filtrar (ej. "Chile"). Si se omite, no filtra. */
  country?: string
}

export interface AnalyticsKpis {
  activeUsers: number
  newUsers: number
  sessions: number
  pageViews: number
  /** Duración promedio de sesión, en segundos. */
  avgSessionDurationSec: number
  /** Tasa de engagement en 0-1 (proporción de sesiones con interacción). */
  engagementRate: number
}

export interface NamedCount {
  label: string
  value: number
}

export interface DailyPoint {
  /** Fecha en formato YYYY-MM-DD. */
  date: string
  activeUsers: number
}

export interface AnalyticsReport {
  rangeDays: number
  country: string | null
  kpis: AnalyticsKpis
  /** Eventos clave de conversión del producto. */
  signups: number
  logins: number
  directionsClicks: number
  shares: number
  saves: number
  searches: number
  reports: number
  /** Canales de adquisición (orgánico, directo, social, referido…). */
  trafficSources: NamedCount[]
  /** Páginas/lugares más vistos. */
  topPages: NamedCount[]
  /** Reparto por tipo de dispositivo (móvil/desktop/tablet). */
  devices: NamedCount[]
  /** Ciudades dentro del país filtrado (Santiago vs regiones). */
  cities: NamedCount[]
  /** Usuarios activos por día (para la mini-tendencia). */
  dailyUsers: DailyPoint[]
}

export interface AnalyticsReportService {
  /** True si hay credenciales configuradas en el entorno. */
  isConfigured(): boolean
  /** Trae el reporte agregado para el rango/país pedido. */
  getReport(query: AnalyticsQuery): Promise<AnalyticsReport>
}
