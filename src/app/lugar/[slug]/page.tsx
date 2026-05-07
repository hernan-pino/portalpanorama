import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { container } from '@lib/container'
import { ListingPlan } from '@domain/listing/ListingPlan'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await container.getGetListingBySlugUseCase().execute({ slug })
  if (!result) return { title: 'Lugar no encontrado' }
  return {
    title: result.listing.name,
    description: result.listing.description,
  }
}

export default async function LugarPage({ params }: PageProps) {
  const { slug } = await params

  const result = await container.getGetListingWithReviewsUseCase().execute({ slug, trackView: true })

  if (!result) notFound()

  const { listing, reviews, stats } = result

  const coverImage = listing.images[0]

  return (
    <div className="page-enter">
      {/* Hero imagen */}
      {coverImage ? (
        <div style={{ width: '100%', aspectRatio: '21/9', maxHeight: '480px', position: 'relative', overflow: 'hidden', background: 'var(--bg-sunken)' }}>
          <Image
            src={coverImage.url}
            alt={coverImage.alt ?? listing.name}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className="placeholder-stripe" style={{ width: '100%', height: '300px' }} data-label={listing.name} />
      )}

      <div className="container" style={{ paddingTop: 'var(--s-10)', paddingBottom: 'var(--s-16)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr minmax(0, 340px)',
            gap: 'var(--s-12)',
            alignItems: 'start',
          }}
        >
          {/* Columna principal */}
          <div>
            {/* Eyebrow */}
            <p className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>
              {listing.neighborhood}
              {listing.isPremium() && (
                <>
                  {' '}·{' '}
                  <span className="premium-badge">Premium</span>
                </>
              )}
            </p>

            {/* Nombre */}
            <h1
              className="display"
              style={{ fontSize: 'var(--t-display-sm)', marginBottom: 'var(--s-5)' }}
            >
              {listing.name}
            </h1>

            {/* Rating */}
            {stats.count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', marginBottom: 'var(--s-6)' }}>
                <span style={{ fontWeight: 600, fontSize: 'var(--t-h3)' }}>
                  {stats.averageRating.toFixed(1)}
                </span>
                <RatingStars rating={stats.averageRating} />
                <span style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
                  ({stats.count} {stats.count === 1 ? 'reseña' : 'reseñas'})
                </span>
              </div>
            )}

            {/* Tags */}
            {listing.tags.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginBottom: 'var(--s-8)' }}>
                {listing.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/explorar?q=${encodeURIComponent(tag.name)}`}
                    className="chip"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Descripción */}
            {listing.description && (
              <div style={{ marginBottom: 'var(--s-10)' }}>
                <h2 style={{ fontSize: 'var(--t-h3)', fontWeight: 500, marginBottom: 'var(--s-4)' }}>
                  Sobre este lugar
                </h2>
                <p style={{ color: 'var(--fg-muted)', lineHeight: 'var(--lh-loose)' }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Galería */}
            {listing.images.length > 1 && (
              <div style={{ marginBottom: 'var(--s-10)' }}>
                <h2 style={{ fontSize: 'var(--t-h3)', fontWeight: 500, marginBottom: 'var(--s-4)' }}>Fotos</h2>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 'var(--s-3)',
                  }}
                >
                  {listing.images.slice(1).map((img) => (
                    <div
                      key={img.id}
                      style={{ aspectRatio: '4/3', position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--bg-sunken)' }}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt ?? listing.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 200px"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reseñas */}
            <div>
              <h2 style={{ fontSize: 'var(--t-h3)', fontWeight: 500, marginBottom: 'var(--s-6)' }}>
                Reseñas {stats.count > 0 && `(${stats.count})`}
              </h2>
              {reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        borderTop: '1px solid var(--surface-line)',
                        paddingTop: 'var(--s-5)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--s-3)', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500, fontSize: 'var(--t-body-sm)' }}>
                          Usuario verificado
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono)', color: 'var(--fg-muted)' }}>
                          {review.rating}/10
                        </span>
                      </div>
                      <p style={{ color: 'var(--fg-muted)', lineHeight: 'var(--lh-loose)', fontSize: 'var(--t-body-sm)' }}>
                        {review.body}
                      </p>
                      {review.response && (
                        <div style={{ marginTop: 'var(--s-4)', padding: 'var(--s-4)', background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)' }}>
                          <p className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>Respuesta del dueño</p>
                          <p style={{ fontSize: 'var(--t-body-sm)', lineHeight: 'var(--lh-loose)' }}>{review.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
                  Todavía no hay reseñas. ¡Sé el primero!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--surface-line)',
              borderRadius: 'var(--r-xl)',
              padding: 'var(--s-6)',
              position: 'sticky',
              top: '88px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--s-5)',
            }}
          >
            <h2 style={{ fontSize: 'var(--t-h4)', fontWeight: 500, margin: 0 }}>Información</h2>

            {listing.address && (
              <InfoRow label="Dirección" value={listing.address} />
            )}
            {listing.phone && (
              <InfoRow label="Teléfono" value={listing.phone} />
            )}
            {listing.website && (
              <InfoRow
                label="Sitio web"
                value={
                  <a
                    href={listing.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-60)', textDecoration: 'underline' }}
                  >
                    Visitar sitio
                  </a>
                }
              />
            )}
            {listing.priceRange && (
              <InfoRow
                label="Precio"
                value={'$'.repeat(listing.priceRange)}
              />
            )}

            <hr className="divider-line" />

            <Link href={`/explorar?barrio=${encodeURIComponent(listing.neighborhood)}`} className="btn btn--ghost btn--sm" style={{ justifyContent: 'center' }}>
              Más en {listing.neighborhood}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow" style={{ marginBottom: 'var(--s-1)' }}>{label}</p>
      <p style={{ fontSize: 'var(--t-body-sm)', lineHeight: 'var(--lh-normal)' }}>{value}</p>
    </div>
  )
}

function RatingStars({ rating }: { rating: number }) {
  const filled = Math.round(rating / 2)
  return (
    <div style={{ display: 'flex', gap: '2px' }} aria-label={`${rating} de 10`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < filled ? 'var(--accent-60)' : 'none'}
          stroke="var(--accent-60)"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}
