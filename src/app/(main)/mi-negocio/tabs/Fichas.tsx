import Link from 'next/link'
import type { GetBusinessDashboardOutput } from '@application/listing/GetBusinessDashboardUseCase'
import { ListingStatus } from '@domain/listing/ListingStatus'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    [ListingStatus.PUBLISHED]: { label: 'Publicado', color: 'var(--success)', bg: 'color-mix(in oklab, var(--success) 10%, transparent)' },
    [ListingStatus.DRAFT]: { label: 'Borrador', color: 'var(--fg-muted)', bg: 'var(--bg-sunken)' },
    [ListingStatus.CLAIMED]: { label: 'Reclamado', color: 'var(--info)', bg: 'color-mix(in oklab, var(--info) 10%, transparent)' },
    [ListingStatus.SUSPENDED]: { label: 'Suspendido', color: 'var(--warning)', bg: 'color-mix(in oklab, var(--warning) 10%, transparent)' },
  }
  const c = map[status] ?? map[ListingStatus.DRAFT]
  return (
    <span style={{
      fontSize: 'var(--t-mono-sm)', fontFamily: 'var(--font-mono)', letterSpacing: 'var(--tr-wider)',
      textTransform: 'uppercase', color: c.color, background: c.bg,
      padding: '2px 8px', borderRadius: 'var(--r-pill)',
    }}>
      {c.label}
    </span>
  )
}

export function TabFichas({ data }: { data: GetBusinessDashboardOutput }) {
  const { listings } = data

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--s-8)' }}>
        <div>
          <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>Mis fichas</h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
            Gestioná tus locales en el directorio.
          </p>
        </div>
        <Link href="/dashboard/listing/nuevo" className="btn btn--primary">
          + Nueva ficha
        </Link>
      </div>

      {listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--s-16) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-4)' }}>
          <p className="display" style={{ fontSize: 'var(--t-h2)', color: 'var(--fg-muted)' }}>
            Todavía no tenés fichas
          </p>
          <Link href="/dashboard/listing/nuevo" className="btn btn--primary">
            Crear mi primera ficha
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          {listings.map(({ listing, reviewStats, analyticsStats }) => (
            <div
              key={listing.id}
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--surface-line)',
                borderRadius: 'var(--r-lg)',
                padding: 'var(--s-6)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 'var(--s-6)',
                alignItems: 'start',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-2)' }}>
                  <h2 style={{ fontSize: 'var(--t-h4)', fontWeight: 500, margin: 0 }}>{listing.name}</h2>
                  <StatusBadge status={listing.status} />
                  {listing.isPremium() && <span className="premium-badge">Premium</span>}
                </div>
                <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-5)' }}>
                  {listing.neighborhood}
                </p>
                <div style={{ display: 'flex', gap: 'var(--s-6)' }}>
                  <StatItem label="Visitas" value={analyticsStats.views} />
                  <StatItem label="Clicks" value={analyticsStats.clicks} />
                  <StatItem label="Reseñas" value={reviewStats.count} />
                  {reviewStats.count > 0 && (
                    <StatItem label="Rating" value={`${reviewStats.averageRating.toFixed(1)}/10`} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', alignItems: 'flex-end' }}>
                <Link href={`/dashboard/listing/${listing.id}/editar`} className="btn btn--ghost btn--sm">
                  Editar
                </Link>
                <Link href={`/lugar/${listing.slug.value}`} className="btn btn--ghost btn--sm" target="_blank">
                  Ver ficha ↗
                </Link>
                {!listing.isPremium() && (
                  <Link href="/mi-negocio?tab=plan" className="btn btn--accent btn--sm">
                    Subir a Premium
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono)', color: 'var(--fg-subtle)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', marginBottom: 'var(--s-1)' }}>
        {label}
      </p>
      <p style={{ fontWeight: 600, fontSize: 'var(--t-h3)' }}>{value}</p>
    </div>
  )
}
