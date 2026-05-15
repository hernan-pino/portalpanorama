import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { ReviewForm } from './ReviewForm'
import { FavoriteButton } from './FavoriteButton'
import { ListingCard } from '@components/listing/ListingCard'

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

  const session = await auth()

  const result = await container.getGetListingWithReviewsUseCase().execute({
    slug,
    userId: session?.user?.id ?? undefined,
    trackView: true,
  })

  if (!result) notFound()

  const { listing, reviews, googleReviews, stats, isFavorite, userReview, ownerName } = result

  const isLoggedIn = !!session?.user?.id

  // "También te puede gustar" — misma categoría, distinto slug, hasta 4
  const related = await container.getSearchListingsUseCase().execute({
    categoryId: listing.categoryId,
    limit: 5,
  })
  const relatedItems = related.items.filter((i) => i.slug !== slug).slice(0, 4)

  const [mainImage, ...thumbImages] = listing.images

  return (
    <div className="page-enter">
      <div className="container">

        {/* ── Hero gallery ── */}
        <div className="place-hero">
          <div style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--bg-sunken)' }}>
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.alt ?? listing.name}
                fill
                priority
                sizes="(max-width: 960px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
            )}
          </div>

          <div style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--bg-sunken)' }}>
            {thumbImages[0] ? (
              <Image
                src={thumbImages[0].url}
                alt={thumbImages[0].alt ?? listing.name}
                fill
                sizes="(max-width: 960px) 100vw, 25vw"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
            )}
          </div>

          <div style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--bg-sunken)' }}>
            {thumbImages[1] ? (
              <Image
                src={thumbImages[1].url}
                alt={thumbImages[1].alt ?? listing.name}
                fill
                sizes="(max-width: 960px) 100vw, 25vw"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
            )}
          </div>
        </div>

        {/* ── Info layout ── */}
        <div className="place-info">

          {/* ── Main column ── */}
          <div>
            {/* Headline block */}
            <div className="place-headline">
              <p className="eyebrow">
                {listing.neighborhood}
                {listing.isPremium() && (
                  <>
                    {' '}·{' '}
                    <span className="premium-badge">Premium</span>
                  </>
                )}
              </p>
              <h1>{listing.name}</h1>

              {stats.count > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
                  <RatingStars rating={stats.averageRating} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono)', letterSpacing: 'var(--tr-wide)', color: 'var(--fg-muted)' }}>
                    {stats.averageRating.toFixed(1)} · {stats.count} {stats.count === 1 ? 'reseña' : 'reseñas'}
                  </span>
                </div>
              )}
            </div>

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
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h3)', fontWeight: 400, marginBottom: 'var(--s-4)', letterSpacing: 'var(--tr-tight)' }}>
                  Sobre este lugar
                </h2>
                <p style={{ color: 'var(--fg-muted)', lineHeight: 'var(--lh-loose)' }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Galería adicional */}
            {thumbImages.length > 2 && (
              <div style={{ marginBottom: 'var(--s-10)' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h3)', fontWeight: 400, marginBottom: 'var(--s-4)', letterSpacing: 'var(--tr-tight)' }}>Fotos</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--s-3)' }}>
                  {thumbImages.slice(2).map((img) => (
                    <div key={img.id} style={{ aspectRatio: '4/3', position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', background: 'var(--bg-sunken)' }}>
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

          </div>

          {/* ── Sidebar ── */}
          <aside className="place-info__sidebar">
            {/* Botón guardar */}
            <FavoriteButton
              listingId={listing.id}
              slug={slug}
              initialIsFavorite={isFavorite}
              isLoggedIn={isLoggedIn}
            />

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h4)', fontWeight: 400, margin: 0, letterSpacing: 'var(--tr-tight)' }}>Información</h2>

            {listing.address && (
              <div className="place-info__row">
                <LocationIcon />
                <span>{listing.address}</span>
              </div>
            )}

            {listing.phone && (
              <div className="place-info__row">
                <PhoneIcon />
                <span>{listing.phone}</span>
              </div>
            )}

            {listing.website && (
              <div className="place-info__row">
                <GlobeIcon />
                <a
                  href={listing.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-60)', textDecoration: 'underline' }}
                >
                  Visitar sitio
                </a>
              </div>
            )}

            {listing.priceRange && (
              <div className="place-info__row">
                <PriceIcon />
                <span>{'$'.repeat(listing.priceRange)}</span>
              </div>
            )}

            <hr className="divider-line" style={{ margin: 0 }} />

            <Link
              href={`/explorar?barrio=${encodeURIComponent(listing.neighborhood)}`}
              className="btn btn--ghost btn--sm"
              style={{ justifyContent: 'center' }}
            >
              Más en {listing.neighborhood}
            </Link>

            {/* Gestionado por — si el owner es BUSINESS_OWNER */}
            {ownerName ? (
              <div style={{
                padding: 'var(--s-5)',
                border: '1px solid var(--surface-line)',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s-3)',
              }}>
                <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', margin: 0, lineHeight: 'var(--lh-loose)' }}>
                  Gestionado por
                </p>
                <Link
                  href={`/perfil-negocio/${listing.ownerId}`}
                  className="btn btn--ghost btn--sm"
                  style={{ justifyContent: 'center' }}
                >
                  {ownerName}
                </Link>
              </div>
            ) : (
              <div style={{
                padding: 'var(--s-5)',
                border: '1px solid var(--surface-line)',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s-3)',
              }}>
                <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', margin: 0, lineHeight: 'var(--lh-loose)' }}>
                  ¿Sos el dueño de este lugar?
                </p>
                <Link
                  href={`/reclamar-ficha/${slug}`}
                  className="btn btn--ghost btn--sm"
                  style={{ justifyContent: 'center' }}
                >
                  Reclamar ficha
                </Link>
              </div>
            )}
          </aside>
        </div>

        {/* ── Reseñas ── */}
        <section style={{ marginTop: 'var(--s-12)', paddingTop: 'var(--s-8)', borderTop: '1px solid var(--surface-line)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h2)', fontWeight: 400, marginBottom: 'var(--s-6)', letterSpacing: 'var(--tr-tight)' }}>
            Reseñas {stats.count > 0 && `(${stats.count})`}
          </h2>

          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="review">
                <div className="review__avatar">
                  <span>U</span>
                </div>
                <div>
                  <div className="review__head">
                    <span className="review__name">Usuario verificado</span>
                    <span className="review__when">{review.rating}/10</span>
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
              </div>
            ))
          ) : (
            <div style={{ paddingTop: 'var(--s-4)', paddingBottom: 'var(--s-6)' }}>
              <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
                Todavía no hay reseñas. ¡Sé el primero!
              </p>
            </div>
          )}

          {googleReviews.filter((gr) => gr.rating >= 4).length > 0 && (
            <div style={{ marginTop: 'var(--s-10)', paddingTop: 'var(--s-8)', borderTop: '1px solid var(--surface-line)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--s-3)', marginBottom: 'var(--s-6)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h4)', fontWeight: 400, letterSpacing: 'var(--tr-tight)', margin: 0 }}>
                  Reseñas de Google
                </h3>
                {listing.googleRating != null && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', color: 'var(--fg-muted)', letterSpacing: 'var(--tr-wide)', textTransform: 'uppercase' }}>
                    {listing.googleRating.toFixed(1)}/5 · {listing.googleReviewCount ?? googleReviews.length} reseñas
                  </span>
                )}
              </div>
              {googleReviews.filter((gr) => gr.rating >= 4).map((gr) => (
                <div key={gr.id} className="review">
                  <div className="review__avatar review__avatar--google">
                    <GoogleIcon />
                  </div>
                  <div>
                    <div className="review__head">
                      <span className="review__name">{gr.authorName}</span>
                      <span className="review__when">{gr.rating.toFixed(1)}/5</span>
                    </div>
                    <p style={{ color: 'var(--fg-muted)', lineHeight: 'var(--lh-loose)', fontSize: 'var(--t-body-sm)' }}>
                      {gr.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 'var(--s-8)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h4)', fontWeight: 400, marginBottom: 'var(--s-4)', letterSpacing: 'var(--tr-tight)' }}>
              Dejá tu opinión
            </h3>
            <ReviewForm slug={slug} isLoggedIn={isLoggedIn} hasReviewed={!!userReview} />
          </div>
        </section>

        {/* ── También te puede gustar ── */}
        {relatedItems.length > 0 && (
          <section style={{ marginTop: 'var(--s-16)', marginBottom: 'var(--s-16)' }}>
            <div className="sec-head">
              <span className="sec-head__num" />
              <h2 className="sec-head__title">
                También te puede <em>gustar</em>
              </h2>
              <Link
                href={`/explorar?barrio=${encodeURIComponent(listing.neighborhood)}`}
                className="sec-head__cta"
              >
                Ver más en {listing.neighborhood} →
              </Link>
            </div>

            {listing.isPremium() && (
              <p style={{
                fontSize: 'var(--t-body-sm)',
                color: 'var(--fg-muted)',
                marginBottom: 'var(--s-6)',
                padding: 'var(--s-3) var(--s-4)',
                background: 'var(--bg-sunken)',
                borderRadius: 'var(--r-sm)',
              }}>
                Como dueño Premium podés{' '}
                <Link href="/mi-negocio?tab=estadisticas" style={{ color: 'var(--accent-60)', textDecoration: 'underline' }}>
                  personalizar o desactivar estas recomendaciones
                </Link>{' '}
                desde tu panel.
              </p>
            )}

            <div className="grid-cards">
              {relatedItems.map((item) => (
                <ListingCard
                  key={item.listingId}
                  listing={{
                    slug: item.slug,
                    name: item.name,
                    neighborhood: item.neighborhood,
                    categoryName: item.categoryName,
                    coverUrl: item.coverUrl,
                    averageRating: item.averageRating,
                    reviewCount: item.reviewCount,
                    isPremium: item.isPremium,
                    tags: item.tags,
                    priceRange: item.priceRange,
                  }}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  )
}

/* ── Icons ── */
function LocationIcon() {
  return (
    <svg className="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg className="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"/>
    </svg>
  )
}
function GlobeIcon() {
  return (
    <svg className="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}
function PriceIcon() {
  return (
    <svg className="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
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
