import Link from 'next/link'
import Image from 'next/image'

export interface ListingCardData {
  slug: string
  name: string
  neighborhood: string
  categoryName?: string
  coverUrl?: string
  averageRating?: number
  isPremium: boolean
  tags: string[]
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link
      href={`/lugar/${listing.slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-raised)',
        border: '1px solid var(--surface-line)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        transition: 'box-shadow var(--d-fast) var(--ease-out), transform var(--d-fast) var(--ease-out)',
        textDecoration: 'none',
      }}
      className={listing.isPremium ? 'is-premium listing-card' : 'listing-card'}
    >
      {/* Cover image */}
      <div
        style={{
          aspectRatio: '16/9',
          background: 'var(--bg-sunken)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {listing.coverUrl ? (
          <Image
            src={listing.coverUrl}
            alt={listing.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--s-4)', display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-2)' }}>
          <h3
            style={{
              fontSize: 'var(--t-h4)',
              fontWeight: 500,
              letterSpacing: 'var(--tr-normal)',
              lineHeight: 'var(--lh-snug)',
              margin: 0,
            }}
          >
            {listing.name}
          </h3>
          {listing.isPremium && (
            <span className="premium-badge" style={{ flexShrink: 0 }}>
              Premium
            </span>
          )}
        </div>

        <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', margin: 0 }}>
          {listing.neighborhood}
          {listing.categoryName ? ` · ${listing.categoryName}` : ''}
        </p>

        {listing.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--s-1)', flexWrap: 'wrap', marginTop: 'var(--s-1)' }}>
            {listing.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 'var(--t-mono-sm)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: 'var(--tr-wide)',
                  textTransform: 'uppercase',
                  color: 'var(--fg-muted)',
                  padding: '2px 6px',
                  background: 'var(--bg-sunken)',
                  borderRadius: 'var(--r-sm)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {listing.averageRating !== undefined && (
          <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', margin: 0, marginTop: 'auto', paddingTop: 'var(--s-2)' }}>
            ★ {listing.averageRating.toFixed(1)}
          </p>
        )}
      </div>
    </Link>
  )
}
