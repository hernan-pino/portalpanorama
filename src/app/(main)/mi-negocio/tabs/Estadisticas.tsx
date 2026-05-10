import type { GetBusinessDashboardOutput } from '@application/listing/GetBusinessDashboardUseCase'

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--surface-line)',
      borderRadius: 'var(--r-lg)',
      padding: 'var(--s-6)',
    }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', color: 'var(--fg-subtle)', marginBottom: 'var(--s-3)' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h1)', fontWeight: 600, marginBottom: sub ? 'var(--s-1)' : 0 }}>
        {typeof value === 'number' ? value.toLocaleString('es-CL') : value}
      </p>
      {sub && (
        <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>{sub}</p>
      )}
    </div>
  )
}

export function TabEstadisticas({ data }: { data: GetBusinessDashboardOutput }) {
  const { listings } = data

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>Estadísticas</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Rendimiento acumulado de tus fichas.
        </p>
      </div>

      {listings.length === 0 ? (
        <p style={{ color: 'var(--fg-muted)' }}>No tenés fichas todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-10)' }}>
          {listings.map(({ listing, analyticsStats, reviewStats }) => (
            <div key={listing.id}>
              <h2 style={{ fontSize: 'var(--t-h4)', fontWeight: 500, marginBottom: 'var(--s-5)' }}>
                {listing.name}
                {listing.isPremium() && <span className="premium-badge" style={{ marginLeft: 'var(--s-2)' }}>Premium</span>}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--s-4)', marginBottom: 'var(--s-6)' }}>
                <StatCard label="Visitas totales" value={analyticsStats.views} sub="Vistas a tu ficha" />
                <StatCard label="Clicks totales" value={analyticsStats.clicks} sub="Clics en contacto o dirección" />
                <StatCard
                  label="Rating promedio"
                  value={reviewStats.count > 0 ? `${reviewStats.averageRating.toFixed(1)}/10` : '—'}
                  sub={`${reviewStats.count} ${reviewStats.count === 1 ? 'reseña' : 'reseñas'}`}
                />
              </div>

              {!listing.isPremium() && (
                <div style={{
                  background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
                  border: '1px solid color-mix(in oklab, var(--accent) 25%, transparent)',
                  borderRadius: 'var(--r-lg)',
                  padding: 'var(--s-4) var(--s-5)',
                  fontSize: 'var(--t-body-sm)',
                  color: 'var(--fg-muted)',
                }}>
                  Con <strong>Premium</strong> accedés a estadísticas por período, fuente de tráfico y posicionamiento en búsqueda.{' '}
                  <a href="/mi-negocio?tab=plan" style={{ color: 'var(--fg-default)', fontWeight: 500 }}>Ver planes →</a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
