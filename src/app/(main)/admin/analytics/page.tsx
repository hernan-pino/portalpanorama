import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'
import type { AnalyticsReport, NamedCount } from '@application/ports/AnalyticsReportService'

export const metadata: Metadata = { title: 'Analítica — Admin' }

const RANGES = [
  { days: 7, label: '7 días' },
  { days: 28, label: '28 días' },
  { days: 90, label: '90 días' },
]

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>
}) {
  const { dias } = await searchParams
  const rangeDays = RANGES.some((r) => String(r.days) === dias) ? Number(dias) : 28

  const result = await container.getGetAdminAnalyticsUseCase().execute({ rangeDays })

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-page__title">Analítica</h1>
          <p className="admin-page__sub">Audiencia en Chile · datos de Google Analytics</p>
        </div>
        <div className="analytics-ranges">
          {RANGES.map((r) => (
            <Link
              key={r.days}
              href={`/admin/analytics?dias=${r.days}`}
              className={`analytics-range${r.days === rangeDays ? ' analytics-range--active' : ''}`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </header>

      {!result.configured ? (
        <NotConfigured />
      ) : 'error' in result ? (
        <p className="admin-empty">No se pudo cargar la analítica: {result.error}</p>
      ) : (
        <AnalyticsBody report={result.report} />
      )}
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="admin-empty">
      <p>La analítica todavía no está conectada.</p>
      <p className="analytics-hint">
        Falta configurar las credenciales de la Google Analytics Data API en el entorno
        (<code>GA4_PROPERTY_ID</code> y <code>GA4_SA_CREDENTIALS</code>).
      </p>
    </div>
  )
}

function AnalyticsBody({ report }: { report: AnalyticsReport }) {
  const { kpis } = report
  return (
    <>
      <div className="analytics-kpis">
        <Kpi label="Usuarios activos" value={fmt(kpis.activeUsers)} />
        <Kpi label="Usuarios nuevos" value={fmt(kpis.newUsers)} />
        <Kpi label="Sesiones" value={fmt(kpis.sessions)} />
        <Kpi label="Páginas vistas" value={fmt(kpis.pageViews)} />
        <Kpi label="Sesión promedio" value={fmtDuration(kpis.avgSessionDurationSec)} />
        <Kpi label="Engagement" value={`${Math.round(kpis.engagementRate * 100)}%`} />
      </div>

      <section className="analytics-section">
        <h2 className="analytics-section__title">Conversiones del producto</h2>
        <div className="analytics-kpis analytics-kpis--events">
          <Kpi label="Registros" value={fmt(report.signups)} />
          <Kpi label="Inicios de sesión" value={fmt(report.logins)} />
          <Kpi label="“Cómo llegar”" value={fmt(report.directionsClicks)} />
          <Kpi label="Guardados" value={fmt(report.saves)} />
          <Kpi label="Compartidos" value={fmt(report.shares)} />
          <Kpi label="Búsquedas" value={fmt(report.searches)} />
          <Kpi label="Reportes" value={fmt(report.reports)} />
        </div>
      </section>

      <div className="analytics-cols">
        <RankCard title="De dónde llega la gente" rows={report.trafficSources} empty="Sin datos de adquisición todavía." />
        <RankCard title="Lugares y páginas más vistas" rows={report.topPages} empty="Sin páginas registradas todavía." />
        <RankCard title="Dispositivo" rows={report.devices} empty="Sin datos de dispositivo todavía." />
        <RankCard title="Ciudades (dentro de Chile)" rows={report.cities} empty="Sin datos de ciudad todavía." />
      </div>

      <section className="analytics-section">
        <h2 className="analytics-section__title">Usuarios activos por día</h2>
        <DailyBars report={report} />
      </section>
    </>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="analytics-kpi">
      <span className="analytics-kpi__value">{value}</span>
      <span className="analytics-kpi__label">{label}</span>
    </div>
  )
}

function RankCard({ title, rows, empty }: { title: string; rows: NamedCount[]; empty: string }) {
  const max = rows.reduce((m, r) => Math.max(m, r.value), 0) || 1
  return (
    <section className="analytics-card">
      <h2 className="analytics-section__title">{title}</h2>
      {rows.length === 0 ? (
        <p className="analytics-hint">{empty}</p>
      ) : (
        <ul className="analytics-rank">
          {rows.map((r, i) => (
            <li key={`${r.label}-${i}`} className="analytics-rank__row">
              <span className="analytics-rank__label" title={r.label}>{r.label}</span>
              <span className="analytics-rank__bar" aria-hidden>
                <span className="analytics-rank__fill" style={{ width: `${(r.value / max) * 100}%` }} />
              </span>
              <span className="analytics-rank__value">{fmt(r.value)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function DailyBars({ report }: { report: AnalyticsReport }) {
  const points = report.dailyUsers
  if (points.length === 0) return <p className="analytics-hint">Sin datos en el rango.</p>
  const max = points.reduce((m, p) => Math.max(m, p.activeUsers), 0) || 1
  return (
    <div className="analytics-bars" role="img" aria-label="Usuarios activos por día">
      {points.map((p) => (
        <div key={p.date} className="analytics-bars__col" title={`${p.date}: ${p.activeUsers}`}>
          <span className="analytics-bars__fill" style={{ height: `${(p.activeUsers / max) * 100}%` }} />
        </div>
      ))}
    </div>
  )
}

function fmt(n: number): string {
  return new Intl.NumberFormat('es-CL').format(n)
}

function fmtDuration(sec: number): string {
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s === 0 ? `${m}m` : `${m}m ${s}s`
}
