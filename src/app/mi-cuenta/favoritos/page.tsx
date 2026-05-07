import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { container } from '@lib/container'
import { RemoveFavoriteButton } from './RemoveFavoriteButton'

export const metadata: Metadata = { title: 'Favoritos — Mi cuenta' }

export default async function FavoritosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/mi-cuenta/favoritos')

  const { favoriteListings } = await container
    .getGetUserDashboardUseCase()
    .execute(session.user.id)

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-10)' }}>
        <h1
          className="display"
          style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}
        >
          Favoritos
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Los lugares que guardaste.
        </p>
      </div>

      {favoriteListings.length === 0 ? (
        <EmptyState />
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
                <p style={{ fontWeight: 500, marginBottom: 'var(--s-1)' }}>
                  {listing.name}
                </p>
                <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
                  {listing.neighborhood}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
                <Link
                  href={`/lugar/${listing.slug.value}`}
                  className="btn btn--ghost btn--sm"
                >
                  Ver ficha ↗
                </Link>
                <RemoveFavoriteButton listingId={listing.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: 'var(--s-16) 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--s-4)',
      }}
    >
      <p
        className="display"
        style={{ fontSize: 'var(--t-h2)', color: 'var(--fg-muted)' }}
      >
        Todavía no tenés favoritos
      </p>
      <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
        Guardá lugares que te interesen y los verás acá.
      </p>
      <Link href="/buscar" className="btn btn--primary">
        Explorar lugares
      </Link>
    </div>
  )
}
