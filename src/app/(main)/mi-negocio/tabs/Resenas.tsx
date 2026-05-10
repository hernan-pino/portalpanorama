import type { GetBusinessDashboardOutput } from '@application/listing/GetBusinessDashboardUseCase'

function RatingBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
      <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--bg-sunken)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--ink-100)', borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', color: 'var(--fg-muted)', minWidth: 32 }}>
        {value.toFixed(1)}
      </span>
    </div>
  )
}

export function TabResenas({ data }: { data: GetBusinessDashboardOutput }) {
  const { listings } = data
  const listingsWithReviews = listings.filter(l => l.reviewStats.count > 0)

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>Reseñas</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Reseñas recibidas en tus fichas.
        </p>
      </div>

      {listingsWithReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--s-16) 0' }}>
          <p className="display" style={{ fontSize: 'var(--t-h2)', color: 'var(--fg-muted)' }}>
            Todavía no tenés reseñas
          </p>
          <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginTop: 'var(--s-3)' }}>
            Compartí tu ficha para que tus clientes te dejen sus comentarios.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
          {listingsWithReviews.map(({ listing, reviewStats }) => (
            <div
              key={listing.id}
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--surface-line)',
                borderRadius: 'var(--r-lg)',
                padding: 'var(--s-6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--s-5)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--t-h4)', fontWeight: 500, marginBottom: 'var(--s-1)' }}>{listing.name}</h2>
                  <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>
                    {reviewStats.count} {reviewStats.count === 1 ? 'reseña' : 'reseñas'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h2)', fontWeight: 600 }}>
                    {reviewStats.averageRating.toFixed(1)}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', color: 'var(--fg-subtle)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase' }}>
                    de 10
                  </p>
                </div>
              </div>

              <RatingBar value={reviewStats.averageRating} />

              <p style={{ marginTop: 'var(--s-5)', fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                Responder a reseñas individuales estará disponible próximamente.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
