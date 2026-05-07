import type { Metadata } from 'next'
import Link from 'next/link'
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
  }>
}

export default async function ExplorarPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q?.trim()
  const barrio = params.barrio && isValidNeighborhood(params.barrio) ? params.barrio : undefined
  const page = params.pagina ? Math.max(1, parseInt(params.pagina, 10)) : 1

  const useCase = container.getSearchListingsUseCase()
  const result = await useCase.execute({ query, neighborhood: barrio, page, limit: 24 })

  const title = query
    ? `"${query}"${barrio ? ` en ${barrio}` : ''}`
    : barrio
      ? barrio
      : 'Todos los lugares'

  return (
    <div className="page-enter">
      {/* Top bar con search */}
      <div style={{ borderBottom: '1px solid var(--surface-line)', background: 'var(--bg)', padding: 'var(--s-5) 0' }}>
        <div className="container">
          <SearchBar compact />
        </div>
      </div>

      <div className="container" style={{ paddingTop: 'var(--s-10)', paddingBottom: 'var(--s-16)' }}>
        {/* Header de resultados */}
        <div style={{ marginBottom: 'var(--s-8)' }}>
          <h1
            className="display"
            style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}
          >
            {title}
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
            {result.total} {result.total === 1 ? 'lugar encontrado' : 'lugares encontrados'}
          </p>
        </div>

        {/* Filtros de barrio */}
        <div style={{ display: 'flex', gap: 'var(--s-2)', flexWrap: 'wrap', marginBottom: 'var(--s-8)' }}>
          <FilterChip
            label="Todo Santiago"
            href={buildUrl(params, { barrio: undefined })}
            active={!barrio}
          />
          {NEIGHBORHOODS.slice(0, 10).map((n) => (
            <FilterChip
              key={n}
              label={n}
              href={buildUrl(params, { barrio: n })}
              active={barrio === n}
            />
          ))}
        </div>

        {/* Grid */}
        {result.items.length > 0 ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--grid-gutter)',
              }}
            >
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

            {/* Paginación */}
            {result.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--s-2)',
                  justifyContent: 'center',
                  marginTop: 'var(--s-12)',
                }}
              >
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
            <p
              className="display"
              style={{ fontSize: 'var(--t-h2)', marginBottom: 'var(--s-3)', color: 'var(--fg-muted)' }}
            >
              Sin resultados
            </p>
            <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-6)' }}>
              No encontramos lugares con esa búsqueda. Probá con otros términos.
            </p>
            <Link href="/explorar" className="btn btn--ghost">
              Ver todos los lugares
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className="chip"
      aria-pressed={active}
    >
      {label}
    </Link>
  )
}

function buildUrl(
  current: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const merged = { ...current, ...overrides }
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(merged)) {
    if (v !== undefined && k !== 'pagina') params.set(k, v)
    else if (v !== undefined) params.set(k, v)
  }
  // Reset to page 1 when filters change (unless explicitly setting pagina)
  if (!('pagina' in overrides)) params.delete('pagina')
  return `/explorar?${params.toString()}`
}
