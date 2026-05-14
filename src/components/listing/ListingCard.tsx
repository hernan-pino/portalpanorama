import Link from 'next/link'
import Image from 'next/image'

export interface ListingCardData {
  slug: string
  name: string
  neighborhood: string
  categoryName?: string
  coverUrl?: string
  averageRating?: number
  reviewCount?: number
  isPremium: boolean
  tags: string[]
  priceRange?: number
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link
      href={`/lugar/${listing.slug}`}
      className={`place-card${listing.isPremium ? ' is-premium' : ''}`}
    >
      {/* Media 4:3 */}
      <div className="place-card__media">
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
        {listing.isPremium && (
          <span className="premium-badge" style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 3, background: 'var(--paper-00)' }}>
            Premium
          </span>
        )}
      </div>

      {/* Body */}
      <div className="place-card__body">
        <div className="place-card__meta">
          {listing.categoryName && <span>{listing.categoryName}</span>}
          {listing.categoryName && <span className="dot" aria-hidden="true" />}
          <span>{listing.neighborhood}</span>
          {listing.priceRange && (
            <>
              <span className="dot" aria-hidden="true" />
              <span>{'$'.repeat(listing.priceRange)}</span>
            </>
          )}
        </div>

        <h3 className="place-card__title">{listing.name}</h3>

        {listing.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 'var(--s-1)', flexWrap: 'wrap' }}>
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
          <div className="place-card__row">
            <span className="rating">
              <svg className="ico ico-sm" viewBox="0 0 24 24" fill="var(--accent-60)" stroke="var(--accent-60)" strokeWidth="1.5" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="rating__num">{listing.averageRating.toFixed(1)}</span>
              {listing.reviewCount !== undefined && (
                <span className="rating__count">· {listing.reviewCount}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
