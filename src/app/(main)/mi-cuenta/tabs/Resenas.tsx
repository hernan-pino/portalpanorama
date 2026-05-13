import Link from 'next/link'
import type { ReviewWithListingView } from '@application/ports/ReviewRepository'

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s-1)' }}>
      <svg viewBox="0 0 24 24" fill="var(--accent-60)" stroke="var(--accent-60)" strokeWidth="1.5" width={14} height={14} aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', color: 'var(--fg-muted)' }}>
        {rating.toFixed(1)}
      </span>
    </span>
  )
}

export function TabResenas({ reviews }: { reviews: ReviewWithListingView[] }) {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
          Mis <em>reseñas</em>
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Las reseñas que escribiste.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--s-16) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-4)' }}>
          <p className="display" style={{ fontSize: 'var(--t-h2)', color: 'var(--fg-muted)' }}>
            Todavía no escribiste reseñas
          </p>
          <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
            Visitá un lugar y contá tu experiencia.
          </p>
          <Link href="/explorar" className="btn btn--ghost">
            Explorar →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--surface-line)',
                borderRadius: 'var(--r-lg)',
                padding: 'var(--s-5) var(--s-6)',
                display: 'flex',
                gap: 'var(--s-5)',
                alignItems: 'flex-start',
              }}
            >
              {/* Thumbnail placeholder */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--r-md)',
                  background: 'var(--bg-sunken)',
                  flexShrink: 0,
                }}
              />

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-1)' }}>
                  <p style={{ fontWeight: 500, fontSize: 'var(--t-body)' }}>
                    {review.listingName}
                  </p>
                  <StarRating rating={review.rating} />
                </div>
                <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {review.body}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--s-2)', flexShrink: 0 }}>
                <Link
                  href={`/lugar/${review.listingSlug}`}
                  className="btn btn--ghost btn--sm"
                >
                  Ver lugar
                </Link>
                <button
                  className="btn btn--ghost btn--sm"
                  disabled
                  style={{ color: 'var(--fg-subtle)', cursor: 'not-allowed' }}
                  title="Próximamente"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
