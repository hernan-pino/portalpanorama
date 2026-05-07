import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { container } from '@lib/container'
import { FeedItemType } from '@domain/feed/FeedItemType'
import type { FeedItem } from '@domain/feed/FeedItem'
import type { Listing } from '@domain/listing/Listing'

export const metadata: Metadata = { title: 'Mi feed — Mi cuenta' }

const FEED_TYPE_LABEL: Record<FeedItemType, string> = {
  [FeedItemType.NEW_PHOTO]: 'Foto nueva',
  [FeedItemType.HOURS_UPDATED]: 'Horario actualizado',
  [FeedItemType.NEW_REVIEW]: 'Nueva reseña',
  [FeedItemType.INFO_UPDATED]: 'Información actualizada',
}

export default async function FeedPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/mi-cuenta/feed')

  const [{ items }, { favoriteListings }] = await Promise.all([
    container.getGetUserFeedUseCase().execute(session.user.id),
    container.getGetUserDashboardUseCase().execute(session.user.id),
  ])

  const listingMap = new Map<string, Listing>(
    favoriteListings.map((l) => [l.id, l]),
  )

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-10)' }}>
        <h1
          className="display"
          style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}
        >
          Mi feed
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Novedades de tus lugares guardados.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          {items.map((item) => (
            <FeedCard
              key={item.id}
              item={item}
              listing={listingMap.get(item.listingId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FeedCard({
  item,
  listing,
}: {
  item: FeedItem
  listing: Listing | undefined
}) {
  const label = FEED_TYPE_LABEL[item.type] ?? 'Actualización'

  return (
    <div
      style={{
        background: item.read ? 'var(--bg-raised)' : 'color-mix(in oklab, var(--accent) 6%, var(--bg-raised))',
        border: '1px solid var(--surface-line)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--s-4) var(--s-6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--s-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)' }}>
        {!item.read && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent)',
              flexShrink: 0,
            }}
          />
        )}
        <div>
          <p style={{ fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-1)' }}>
            <strong>{listing?.name ?? 'Un lugar guardado'}</strong>
            {' — '}
            {label}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--t-mono-sm)',
              color: 'var(--fg-subtle)',
              letterSpacing: 'var(--tr-wider)',
              textTransform: 'uppercase',
            }}
          >
            {item.createdAt.toLocaleDateString('es-CL', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {listing && (
        <Link
          href={`/lugar/${listing.slug.value}`}
          className="btn btn--ghost btn--sm"
          style={{ flexShrink: 0 }}
        >
          Ver ficha ↗
        </Link>
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
        Sin novedades por ahora
      </p>
      <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
        Guardá lugares y verás acá cuando actualicen su información.
      </p>
      <Link href="/buscar" className="btn btn--primary">
        Explorar lugares
      </Link>
    </div>
  )
}
