import Link from 'next/link'
import { ListingCard } from '@components/listing/ListingCard'
import { ListingPlan } from '@domain/listing/ListingPlan'
import type { Listing } from '@domain/listing/Listing'

export function TabGuardados({ favoriteListings }: { favoriteListings: Listing[] }) {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)' }}>
          Lugares <em>guardados</em>
        </h1>
      </div>

      {favoriteListings.length === 0 ? (
        <div
          style={{
            border: '1px dashed var(--surface-line)',
            borderRadius: 'var(--r-lg)',
            padding: 'var(--s-10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--s-3)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
            Guarda más lugares
          </p>
          <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', maxWidth: 280 }}>
            Busca y conecta con mejores lugares para guardarlos aquí.
          </p>
          <Link href="/explorar" className="btn btn--ghost" style={{ marginTop: 'var(--s-2)' }}>
            Explorar →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--s-5)',
          }}
        >
          {favoriteListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={{
                slug: listing.slug.value,
                name: listing.name,
                neighborhood: listing.neighborhood as string,
                coverUrl: listing.images[0]?.url,
                isPremium: listing.plan === ListingPlan.PREMIUM,
                tags: listing.tags.map((t) => t.name),
                priceRange: listing.priceRange,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
