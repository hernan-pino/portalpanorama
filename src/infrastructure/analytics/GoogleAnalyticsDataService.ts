import { BetaAnalyticsDataClient } from '@google-analytics/data'
import type {
  AnalyticsQuery,
  AnalyticsReport,
  AnalyticsReportService,
  DailyPoint,
  NamedCount,
} from '@application/ports/AnalyticsReportService'

// Nombres de los eventos custom que cablea lib/analytics.ts. Mapean a las métricas
// de conversión del panel.
const EVENT = {
  signup: 'sign_up',
  login: 'login',
  directions: 'click_como_llegar',
  share: 'compartir_lugar',
  save: 'guardar_lugar',
  search: 'buscar',
  report: 'reportar_lugar',
} as const

/**
 * Implementación del puerto de analítica sobre la Google Analytics Data API (GA4).
 * Es el único archivo que importa el SDK de Google y lee las credenciales del entorno.
 *
 * Credenciales (en orden de preferencia):
 *  - GA4_SA_CREDENTIALS: el JSON de la cuenta de servicio, como string JSON o en base64
 *    (se usa en Vercel, marcada Sensitive).
 *  - GA4_KEY_FILE: ruta a un archivo .json de la cuenta de servicio (cómodo en local).
 */
export class GoogleAnalyticsDataService implements AnalyticsReportService {
  private readonly propertyId = process.env.GA4_PROPERTY_ID

  isConfigured(): boolean {
    return Boolean(
      this.propertyId && (process.env.GA4_SA_CREDENTIALS || process.env.GA4_KEY_FILE),
    )
  }

  private buildClient(): BetaAnalyticsDataClient {
    const raw = process.env.GA4_SA_CREDENTIALS
    if (raw) {
      const json = raw.trim().startsWith('{')
        ? raw
        : Buffer.from(raw, 'base64').toString('utf8')
      const creds = JSON.parse(json) as { client_email: string; private_key: string; project_id?: string }
      return new BetaAnalyticsDataClient({
        credentials: { client_email: creds.client_email, private_key: creds.private_key },
        projectId: creds.project_id,
      })
    }
    const keyFilename = process.env.GA4_KEY_FILE
    if (keyFilename) return new BetaAnalyticsDataClient({ keyFilename })
    throw new Error('Faltan credenciales de GA4 (GA4_SA_CREDENTIALS o GA4_KEY_FILE).')
  }

  async getReport(query: AnalyticsQuery): Promise<AnalyticsReport> {
    if (!this.propertyId) {
      throw new Error('Falta GA4_PROPERTY_ID en el entorno.')
    }
    const client = this.buildClient()
    const property = `properties/${this.propertyId}`
    const dateRanges = [{ startDate: `${query.rangeDays}daysAgo`, endDate: 'today' }]
    const countryFilter = query.country
      ? {
          filter: {
            fieldName: 'country',
            stringFilter: { matchType: 'EXACT' as const, value: query.country },
          },
        }
      : undefined

    // Siete reportes en paralelo. Cada uno ya filtrado por país.
    const [kpiRes, dailyRes, eventRes, sourceRes, pageRes, deviceRes, cityRes] = await Promise.all([
      client.runReport({
        property,
        dateRanges,
        dimensionFilter: countryFilter,
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'engagementRate' },
        ],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensionFilter: countryFilter,
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensionFilter: this.andCountryAndEvents(query.country),
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensionFilter: countryFilter,
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensionFilter: countryFilter,
        dimensions: [{ name: 'pageTitle' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
      }),
      client.runReport({
        property,
        dateRanges,
        dimensionFilter: countryFilter,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      }),
      client.runReport({
        property,
        dateRanges,
        dimensionFilter: countryFilter,
        dimensions: [{ name: 'city' }],
        metrics: [{ name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 8,
      }),
    ])

    const kpiRow = kpiRes[0].rows?.[0]?.metricValues ?? []
    const num = (i: number) => Number(kpiRow[i]?.value ?? 0)

    const events = new Map<string, number>()
    for (const row of eventRes[0].rows ?? []) {
      const name = row.dimensionValues?.[0]?.value ?? ''
      events.set(name, Number(row.metricValues?.[0]?.value ?? 0))
    }

    const dailyUsers: DailyPoint[] = (dailyRes[0].rows ?? []).map((row) => ({
      date: formatGaDate(row.dimensionValues?.[0]?.value ?? ''),
      activeUsers: Number(row.metricValues?.[0]?.value ?? 0),
    }))

    const trafficSources: NamedCount[] = (sourceRes[0].rows ?? []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || '(sin definir)',
      value: Number(row.metricValues?.[0]?.value ?? 0),
    }))

    const topPages: NamedCount[] = (pageRes[0].rows ?? []).map((row) => ({
      label: cleanTitle(row.dimensionValues?.[0]?.value ?? ''),
      value: Number(row.metricValues?.[0]?.value ?? 0),
    }))

    const devices: NamedCount[] = (deviceRes[0].rows ?? []).map((row) => ({
      label: deviceLabel(row.dimensionValues?.[0]?.value ?? ''),
      value: Number(row.metricValues?.[0]?.value ?? 0),
    }))

    const cities: NamedCount[] = (cityRes[0].rows ?? [])
      .map((row) => ({
        label: row.dimensionValues?.[0]?.value || '(sin definir)',
        value: Number(row.metricValues?.[0]?.value ?? 0),
      }))
      .filter((c) => c.label !== '(not set)')

    return {
      rangeDays: query.rangeDays,
      country: query.country ?? null,
      kpis: {
        activeUsers: num(0),
        newUsers: num(1),
        sessions: num(2),
        pageViews: num(3),
        avgSessionDurationSec: Math.round(num(4)),
        engagementRate: num(5),
      },
      signups: events.get(EVENT.signup) ?? 0,
      logins: events.get(EVENT.login) ?? 0,
      directionsClicks: events.get(EVENT.directions) ?? 0,
      shares: events.get(EVENT.share) ?? 0,
      saves: events.get(EVENT.save) ?? 0,
      searches: events.get(EVENT.search) ?? 0,
      reports: events.get(EVENT.report) ?? 0,
      trafficSources,
      topPages,
      devices,
      cities,
      dailyUsers,
    }
  }

  /** Combina el filtro de país con el de eventos de conversión (andGroup). */
  private andCountryAndEvents(country?: string) {
    const eventFilter = {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: Object.values(EVENT) },
      },
    }
    if (!country) return eventFilter
    return {
      andGroup: {
        expressions: [
          {
            filter: {
              fieldName: 'country',
              stringFilter: { matchType: 'EXACT' as const, value: country },
            },
          },
          eventFilter,
        ],
      },
    }
  }
}

/** GA4 devuelve la fecha como 'YYYYMMDD'; la pasamos a 'YYYY-MM-DD'. */
function formatGaDate(raw: string): string {
  if (raw.length !== 8) return raw
  return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

/** Quita el sufijo del template de título para que la tabla sea más legible. */
function cleanTitle(title: string): string {
  return title.replace(/\s*[—-]\s*Portal Panorama\s*$/, '').trim() || title
}

/** Traduce la categoría de dispositivo de GA4 al español. */
function deviceLabel(raw: string): string {
  const map: Record<string, string> = { mobile: 'Móvil', desktop: 'Escritorio', tablet: 'Tablet' }
  return map[raw] ?? (raw || '(sin definir)')
}
