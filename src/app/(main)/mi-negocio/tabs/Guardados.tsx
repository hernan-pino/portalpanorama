import Link from 'next/link'
import type { Listing } from '@domain/listing/Listing'

export function TabGuardados({ favoriteListings }: { favoriteListings: Listing[] }) {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>Guardados</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>Los lugares que guardaste.</p>
      </div>

      {favoriteListings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--s-16) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-4)' }}>
          <p className="display" style={{ fontSize: 'var(--t-h2)', color: 'var(--fg-muted)' }}>
            Todavía no tenés guardados
          </p>
          <Link href="/explorar" className="btn btn--primary">Explorar lugares</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {favoriteListings.map((listing) => (
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
              <div>
                <p style={{ fontWeight: 500, marginBottom: 'var(--s-1)' }}>{listing.name}</p>
                <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>{listing.neighborhood}</p>
              </div>
              <Link href={`/lugar/${listing.slug.value}`} className="btn btn--ghost btn--sm">
                Ver ficha ↗
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
