import Link from 'next/link'
import type { GetBusinessDashboardOutput } from '@application/listing/GetBusinessDashboardUseCase'
import { ListingStatus } from '@domain/listing/ListingStatus'

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: 'var(--bg-raised)',
      border: '1px solid var(--surface-line)',
      borderRadius: 'var(--r-lg)',
      padding: 'var(--s-5) var(--s-6)',
    }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', color: 'var(--fg-subtle)', marginBottom: 'var(--s-2)' }}>
        {label}
      </p>
      <p style={{ fontSize: 'var(--t-h2)', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
        {typeof value === 'number' ? value.toLocaleString('es-CL') : value}
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    [ListingStatus.PUBLISHED]: { label: 'Publicado', color: 'var(--success)' },
    [ListingStatus.DRAFT]: { label: 'Borrador', color: 'var(--fg-muted)' },
    [ListingStatus.CLAIMED]: { label: 'Reclamado', color: 'var(--info)' },
    [ListingStatus.SUSPENDED]: { label: 'Suspendido', color: 'var(--warning)' },
  }
  const c = map[status] ?? map[ListingStatus.DRAFT]
  return (
    <span style={{ fontSize: 'var(--t-mono-sm)', fontFamily: 'var(--font-mono)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', color: c.color }}>
      {c.label}
    </span>
  )
}

export function TabResumen({ data }: { data: GetBusinessDashboardOutput }) {
  const { listings } = data
  const totalViews = listings.reduce((acc, l) => acc + l.analyticsStats.views, 0)
  const totalClicks = listings.reduce((acc, l) => acc + l.analyticsStats.clicks, 0)
  const totalReviews = listings.reduce((acc, l) => acc + l.reviewStats.count, 0)
  const avgRating = totalReviews > 0
    ? (listings.reduce((acc, l) => acc + l.reviewStats.averageRating * l.reviewStats.count, 0) / totalReviews).toFixed(1)
    : '—'

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>Resumen</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Vista general de tu actividad.
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--s-4)', marginBottom: 'var(--s-10)' }}>
        <KpiCard label="Visitas" value={totalViews} />
        <KpiCard label="Clicks" value={totalClicks} />
        <KpiCard label="Reseñas" value={totalReviews} />
        <KpiCard label="Rating" value={avgRating} />
      </div>

      {/* Fichas */}
      {listings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <h2 style={{ fontSize: 'var(--t-h4)', fontWeight: 500, marginBottom: 'var(--s-4)' }}>
            Estado de tus fichas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            {listings.map(({ listing, reviewStats, analyticsStats }) => (
              <div
                key={listing.id}
                style={{
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--surface-line)',
                  borderRadius: 'var(--r-lg)',
                  padding: 'var(--s-5) var(--s-6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--s-4)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
                  <div>
                    <p style={{ fontWeight: 500, marginBottom: 'var(--s-1)' }}>{listing.name}</p>
                    <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center' }}>
                      <StatusBadge status={listing.status} />
                      {listing.isPremium() && <span className="premium-badge">Premium</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--s-6)', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>
                    {analyticsStats.views.toLocaleString('es-CL')} visitas · {reviewStats.count} reseñas
                  </span>
                  <Link href={`/mi-negocio?tab=fichas`} className="btn btn--ghost btn--sm">
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: 'var(--s-16) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-4)' }}>
      <p className="display" style={{ fontSize: 'var(--t-h2)', color: 'var(--fg-muted)' }}>
        Todavía no tenés fichas
      </p>
      <Link href="/mi-negocio?tab=fichas" className="btn btn--primary">
        Crear mi primera ficha
      </Link>
    </div>
  )
}
