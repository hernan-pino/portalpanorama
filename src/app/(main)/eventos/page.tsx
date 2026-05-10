import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchBar } from '@components/search/SearchBar'
import { FilterRail } from '@components/search/FilterRail'
import { container } from '@lib/container'
import { parseSearchParams, type RawSearchParams } from '@lib/parseSearchParams'

export const metadata: Metadata = { title: 'Eventos esta semana — Portal Panorama' }

interface PageProps {
  searchParams: Promise<RawSearchParams>
}

export default async function EventosPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const { query, barrio, categoria, priceRanges, isPremium, page } = parseSearchParams(raw)
  // Eventos usa lista por defecto; solo cambia a grid si se pide explícitamente
  const view = raw.view === 'grid' ? 'grid' : 'lista'

  const useCase = container.getSearchListingsUseCase()
  const result = await useCase.execute({
    query,
    neighborhood: barrio,
    categorySlug: categoria,
    priceRanges,
    isPremium,
    page,
    limit: 24,
  })

  const activeLabel = query ?? barrio ?? categoria ?? 'esta semana'

  return (
    <div className="page-enter">
      <div className="search-shell container">

        <FilterRail />

        <div className="search-shell__main">

          {/* Breadcrumb + título */}
          <div className="search-head">
            <nav style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--fg-muted)', display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
              <Link href="/explorar" style={{ color: 'inherit', textDecoration: 'none' }}>Explorar</Link>
              <span style={{ opacity: 0.4 }}>/</span>
              <Link href="/eventos" style={{ color: 'inherit', textDecoration: 'none' }}>Eventos</Link>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: 'var(--fg)' }}>{activeLabel}</span>
            </nav>
            <h1 className="search-head__title">
              <span style={{ fontStyle: 'normal' }}>Eventos </span>
              <em style={{ color: 'var(--accent-60)' }}>{activeLabel}</em>
            </h1>
            <div className="search-head__bar">
              <SearchBar compact />
            </div>
          </div>

          {/* Results bar */}
          <div className="results-bar">
            <div className="results-bar__count">
              <strong>{result.total}</strong>{' '}
              {result.total === 1 ? 'lugar' : 'lugares'}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: 'var(--s-3)' }}>
                ordenado por relevancia
              </span>
            </div>
            <div className="results-bar__tools">
              <div className="toggle-group">
                <Link href={buildUrl(raw, { view: 'grid' })} aria-pressed={view === 'grid'}>
                  <GridIcon /> Grid
                </Link>
                <Link href={buildUrl(raw, { view: 'lista' })} aria-pressed={view === 'lista'}>
                  <ListIcon /> Lista
                </Link>
              </div>
            </div>
          </div>

          {/* Results — lista por defecto */}
          {result.items.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="results-grid">
                  {result.items.map((item) => (
                    <div key={item.listingId} className="place-card">
                      <Link href={`/lugar/${item.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}>
                        <div className="place-card__media">
                          <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div className="place-card__body">
                          <div className="place-card__meta"><span>{item.neighborhood}</span></div>
                          <h3 className="place-card__title">{item.name}</h3>
                          {item.averageRating !== undefined && (
                            <div className="place-card__foot">
                              <span className="rating">
                                <StarIcon />
                                <span className="rating__num">{item.averageRating.toFixed(1)}</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="results-list">
                  {result.items.map((item) => (
                    <Link key={item.listingId} href={`/lugar/${item.slug}`} className="place-row">
                      <div className="place-row__media">
                        <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
                      </div>
                      <div className="place-row__body">
                        <div className="place-card__meta">
                          <span>{item.categoryName}</span>
                          <span className="dot" aria-hidden="true" />
                          <span>{item.neighborhood}</span>
                          {item.isPremium && (
                            <><span className="dot" aria-hidden="true" /><span className="premium-badge" style={{ fontSize: '10px', padding: '2px 6px' }}>Premium</span></>
                          )}
                        </div>
                        <h3 className="place-row__title">{item.name}</h3>
                        {item.description && (
                          <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', margin: '4px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
                            {item.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center', marginTop: 'var(--s-2)' }}>
                          {item.averageRating !== undefined && (
                            <span className="rating">
                              <StarIcon />
                              <span className="rating__num">{item.averageRating.toFixed(1)}</span>
                              {item.reviewCount > 0 && <span className="rating__count">· {item.reviewCount}</span>}
                            </span>
                          )}
                          {item.priceRange && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-muted)' }}>{'$'.repeat(item.priceRange)}</span>
                          )}
                        </div>
                      </div>
                      <span className="place-row__cta" aria-hidden="true"><ArrowIcon /></span>
                    </Link>
                  ))}
                </div>
              )}

              {result.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 'var(--s-2)', justifyContent: 'center', marginTop: 'var(--s-12)' }}>
                  {page > 1 && (
                    <Link href={buildUrl(raw, { pagina: String(page - 1) })} className="btn btn--ghost btn--sm">← Anterior</Link>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', padding: '0 var(--s-3)' }}>
                    {page} / {result.totalPages}
                  </span>
                  {page < result.totalPages && (
                    <Link href={buildUrl(raw, { pagina: String(page + 1) })} className="btn btn--ghost btn--sm">Siguiente →</Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 'var(--s-16)', paddingBottom: 'var(--s-16)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h2)', marginBottom: 'var(--s-3)', color: 'var(--fg-muted)', fontStyle: 'italic' }}>
                Sin resultados
              </p>
              <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-6)' }}>
                No encontramos eventos con esa búsqueda.
              </p>
              <Link href="/eventos" className="btn btn--ghost">Ver todos los eventos</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Icons ── */
function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
    </svg>
  )
}
function StarIcon() {
  return (
    <svg className="ico ico-sm" viewBox="0 0 24 24" fill="var(--accent-60)" stroke="var(--accent-60)" strokeWidth="1.5" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}
function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function buildUrl(current: Record<string, string | undefined>, overrides: Record<string, string | undefined>): string {
  const merged = { ...current, ...overrides }
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined) p.set(k, v)
  }
  if (!('pagina' in overrides)) p.delete('pagina')
  return `/eventos?${p.toString()}`
}
