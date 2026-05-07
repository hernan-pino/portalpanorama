import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { SearchBar } from '@components/search/SearchBar'
import { ListingCard } from '@components/listing/ListingCard'
import { container } from '@lib/container'
import { NEIGHBORHOODS, isValidNeighborhood } from '@domain/shared/Neighborhoods'

export const metadata: Metadata = { title: 'Explorar lugares' }

interface PageProps {
  searchParams: Promise<{
    q?: string
    barrio?: string
    categoria?: string
    pagina?: string
    view?: string
  }>
}

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$']

export default async function ExplorarPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q?.trim()
  const barrio = params.barrio && isValidNeighborhood(params.barrio) ? params.barrio : undefined
  const view = params.view === 'lista' ? 'lista' : 'grid'
  const page = params.pagina ? Math.max(1, parseInt(params.pagina, 10)) : 1

  const useCase = container.getSearchListingsUseCase()
  const result = await useCase.execute({ query, neighborhood: barrio, page, limit: 24 })

  const eyebrow = query
    ? `RESULTADOS PARA "${query.toUpperCase()}"`
    : barrio
      ? `EXPLORAR · ${barrio.toUpperCase()}`
      : 'EXPLORAR'

  const title = query ?? barrio ?? 'Todo Santiago'

  return (
    <div className="page-enter">
      <div className="search-shell container">

        {/* ── Filter rail ── */}
        <aside className="filter-rail">
          <h5>Barrio</h5>
          {NEIGHBORHOODS.map((n) => (
            <label key={n}>
              <input
                type="checkbox"
                defaultChecked={barrio === n}
                readOnly
              />
              <span>{n}</span>
            </label>
          ))}

          <h5>Precio</h5>
          {PRICE_RANGES.map((p) => (
            <label key={p}>
              <input type="checkbox" readOnly />
              <span>{p}</span>
            </label>
          ))}

          <h5>Horario</h5>
          <label>
            <input type="checkbox" readOnly />
            <span>Abierto ahora</span>
          </label>
          <label>
            <input type="checkbox" readOnly />
            <span>Hasta tarde (post 22:00)</span>
          </label>
        </aside>

        {/* ── Main ── */}
        <div className="search-shell__main">
          {/* Search head */}
          <div className="search-head">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="search-head__title">{title}</h1>
            <div className="search-head__bar">
              <SearchBar compact />
            </div>
          </div>

          {/* Results bar */}
          <div className="results-bar">
            <div className="results-bar__count">
              <strong>{result.total}</strong>{' '}
              {result.total === 1 ? 'lugar' : 'lugares'}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--fg-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginLeft: '8px' }}>
                ordenado por relevancia
              </span>
            </div>
            <div className="results-bar__tools">
              <div className="toggle-group">
                <Link
                  href={buildUrl(params, { view: 'grid' })}
                  aria-pressed={view === 'grid'}
                >
                  <GridIcon /> Grid
                </Link>
                <Link
                  href={buildUrl(params, { view: 'lista' })}
                  aria-pressed={view === 'lista'}
                >
                  <ListIcon /> Lista
                </Link>
              </div>
            </div>
          </div>

          {/* Results */}
          {result.items.length > 0 ? (
            <>
              {view === 'grid' ? (
                <div className="results-grid">
                  {result.items.map((item) => (
                    <ListingCard
                      key={item.listingId}
                      listing={{
                        slug: item.slug,
                        name: item.name,
                        neighborhood: item.neighborhood,
                        averageRating: item.averageRating,
                        isPremium: false,
                        tags: [],
                      }}
                    />
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
                          <span>{item.neighborhood}</span>
                        </div>
                        <h3 className="place-row__title">{item.name}</h3>
                        {item.averageRating !== undefined && (
                          <div className="place-row__foot">
                            <span className="rating">
                              <StarIcon />
                              <span className="rating__num">{item.averageRating.toFixed(1)}</span>
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="place-row__cta" aria-hidden="true">
                        <ArrowIcon />
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Paginación */}
              {result.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 'var(--s-2)', justifyContent: 'center', marginTop: 'var(--s-12)' }}>
                  {page > 1 && (
                    <Link href={buildUrl(params, { pagina: String(page - 1) })} className="btn btn--ghost btn--sm">
                      ← Anterior
                    </Link>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', padding: '0 var(--s-3)' }}>
                    {page} / {result.totalPages}
                  </span>
                  {page < result.totalPages && (
                    <Link href={buildUrl(params, { pagina: String(page + 1) })} className="btn btn--ghost btn--sm">
                      Siguiente →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 'var(--s-16)', paddingBottom: 'var(--s-16)' }}>
              <p className="display" style={{ fontSize: 'var(--t-h2)', marginBottom: 'var(--s-3)', color: 'var(--fg-muted)' }}>
                Sin resultados
              </p>
              <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-6)' }}>
                No encontramos lugares con esa búsqueda. Probá con otros términos.
              </p>
              <Link href="/explorar" className="btn btn--ghost">Ver todos los lugares</Link>
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

/* ── Helpers ── */
function buildUrl(current: Record<string, string | undefined>, overrides: Record<string, string | undefined>): string {
  const merged = { ...current, ...overrides }
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined) p.set(k, v)
  }
  if (!('pagina' in overrides)) p.delete('pagina')
  return `/explorar?${p.toString()}`
}
