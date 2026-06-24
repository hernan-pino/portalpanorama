import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { SearchBar } from '@components/search/SearchBar'
import { Filters } from '@components/search/Filters'
import { PlaceCard, type SaveContext } from '@components/place/PlaceCard'
import { LoginEventTracker } from '@components/analytics/LoginEventTracker'
import { Collection } from '@domain/collection/Collection'
import { parseSearchParams, type RawSearchParams } from '@lib/parseSearchParams'

export const metadata: Metadata = { title: 'Explorar lugares — Portal Panorama' }

interface PageProps {
  searchParams: Promise<RawSearchParams>
}

export default async function ExplorarPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const f = parseSearchParams(raw)
  const session = await auth()
  const userId = session?.user?.id ?? undefined

  // Discovery + facetas + catálogo de categorías (para la franja y las subcategorías).
  const [result, facets, categories] = await Promise.all([
    container.getSearchPlacesUseCase().execute({
      query: f.query,
      categorySlug: f.categorySlug,
      subcategorySlug: f.subcategorySlug,
      communeSlug: f.communeSlug,
      neighborhoodSlug: f.neighborhoodSlug,
      metroLineCode: f.metroLineCode,
      metroStationSlug: f.metroStationSlug,
      priceRanges: f.priceRanges,
      socialTagSlugs: f.socialTagSlugs,
      accessTagSlugs: f.accessTagSlugs,
      vibeTagSlugs: f.vibeTagSlugs,
      walkInOnly: f.walkInOnly,
      page: f.page,
      limit: 24,
    }),
    container.getGetPlaceFacetsUseCase().execute(),
    container.getGetCategoriesUseCase().execute(),
  ])

  // Contexto de guardado (corazón de la tarjeta): listas + lugares ya guardados +
  // lista por defecto. Se trae una vez para todas las tarjetas.
  let save: SaveContext = {
    isLoggedIn: !!userId, collections: [], savedPlaceIds: [],
    defaultCollectionId: null, defaultName: Collection.DEFAULT_NAME,
  }
  if (userId) {
    const ctx = await container.getGetSaveContextUseCase().execute(userId)
    save = {
      isLoggedIn: true,
      collections: ctx.collections.map((c) => ({ id: c.id, name: c.name, itemCount: c.itemCount })),
      savedPlaceIds: ctx.savedPlaceIds,
      defaultCollectionId: ctx.defaultCollectionId,
      defaultName: Collection.DEFAULT_NAME,
    }
  }

  // Mapas de contador/label para la franja de categorías y el pill de activos.
  const catCount = new Map(facets.categories.map((c) => [c.value, c.count]))
  const subCount = new Map(facets.subcategories.map((s) => [s.value, s.count]))
  const labelOf = (opts: { value: string; label: string }[]) =>
    new Map(opts.map((o) => [o.value, o.label]))
  const socialLabels = labelOf(facets.social)
  const priceLabels = labelOf(facets.priceRanges)
  const communeLabels = labelOf(facets.communes)
  const hoodLabels = labelOf(facets.neighborhoods)
  const metroLabels = labelOf(facets.metroLines)
  const vibeLabels = labelOf(facets.vibe)
  const accessLabels = labelOf(facets.access)

  const activeCategory = categories.find((c) => c.slug === f.categorySlug)
  // Subcategorías del rubro activo que tengan lugares (contador > 0).
  const activeSubs = activeCategory
    ? activeCategory.subcategories.filter((s) => (subCount.get(s.slug) ?? 0) > 0)
    : []

  // ── URLs (transporte: arman el query string preservando el resto) ──
  const base = () => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(raw)) if (typeof v === 'string' && v) p.set(k, v)
    return p
  }
  const hrefWith = (mut: (p: URLSearchParams) => void) => {
    const p = base()
    p.delete('pagina')
    mut(p)
    const qs = p.toString()
    return qs ? `/explorar?${qs}` : '/explorar'
  }
  const categoryHref = (slug: string) =>
    hrefWith((p) => {
      if (p.get('categoria') === slug) { p.delete('categoria'); p.delete('subcategoria') }
      else { p.set('categoria', slug); p.delete('subcategoria') }
    })
  const subcategoryHref = (slug: string) =>
    hrefWith((p) => { if (p.get('subcategoria') === slug) p.delete('subcategoria'); else p.set('subcategoria', slug) })
  const viewHref = (view: 'grid' | 'lista') => hrefWith((p) => p.set('view', view))
  const pageHref = (n: number) => {
    const p = base()
    p.set('pagina', String(n))
    return `/explorar?${p.toString()}`
  }
  const removeSingle = (key: string) => hrefWith((p) => p.delete(key))
  const removeFromMulti = (key: string, value: string) =>
    hrefWith((p) => {
      const next = (p.get(key) ?? '').split(',').filter((v) => v && v !== value)
      if (next.length) p.set(key, next.join(',')); else p.delete(key)
    })

  // ── Chips de filtros activos (4E §8.6: qué se está buscando, reversible) ──
  const activeChips: { label: string; href: string }[] = []
  if (f.query) activeChips.push({ label: `“${f.query}”`, href: removeSingle('q') })
  if (activeCategory) activeChips.push({ label: activeCategory.name, href: removeSingle('categoria') })
  if (f.subcategorySlug) {
    const sub = activeCategory?.subcategories.find((s) => s.slug === f.subcategorySlug)
    if (sub) activeChips.push({ label: sub.name, href: removeSingle('subcategoria') })
  }
  for (const slug of f.socialTagSlugs ?? [])
    activeChips.push({ label: socialLabels.get(slug) ?? slug, href: removeFromMulti('con', slug) })
  for (const pr of f.priceRanges ?? [])
    activeChips.push({ label: priceLabels.get(pr) ?? pr, href: removeFromMulti('precio', pr) })
  if (f.communeSlug) activeChips.push({ label: communeLabels.get(f.communeSlug) ?? f.communeSlug, href: removeSingle('comuna') })
  if (f.neighborhoodSlug) activeChips.push({ label: hoodLabels.get(f.neighborhoodSlug) ?? f.neighborhoodSlug, href: removeSingle('barrio') })
  if (f.metroLineCode) activeChips.push({ label: metroLabels.get(f.metroLineCode) ?? f.metroLineCode, href: removeSingle('metro') })
  for (const slug of f.vibeTagSlugs ?? [])
    activeChips.push({ label: vibeLabels.get(slug) ?? slug, href: removeFromMulti('ambiente', slug) })
  for (const slug of f.accessTagSlugs ?? [])
    activeChips.push({ label: accessLabels.get(slug) ?? slug, href: removeFromMulti('acceso', slug) })
  if (f.walkInOnly) activeChips.push({ label: 'Sin reserva', href: removeSingle('sinreserva') })

  return (
    <div className="explorar page-enter">
      <LoginEventTracker />
      <div className="explorar__head container">
        <div className="hero__eyebrow" style={{ margin: 0 }}>
          <span className="line" aria-hidden="true" />
          <span className="eyebrow">Explorar · Lugares</span>
        </div>
        <h1 className="explorar__title">
          Qué hacer en <em>Santiago</em>
        </h1>
        <SearchBar compact />

        {/* Franja de categorías (protagonista, ambas vistas — §8.1/§8.3) */}
        <nav className="cat-strip" aria-label="Categorías">
          {categories.map((c) => {
            const active = c.slug === f.categorySlug
            const count = catCount.get(c.slug) ?? 0
            return (
              <Link
                key={c.slug}
                href={categoryHref(c.slug)}
                className={`cat-chip${active ? ' is-active' : ''}`}
                aria-pressed={active}
              >
                {c.name}
                <span className="cat-chip__count">{count}</span>
              </Link>
            )
          })}
        </nav>

        {/* Subcategorías del rubro elegido */}
        {activeSubs.length > 0 && (
          <nav className="sub-strip" aria-label="Subcategorías">
            {activeSubs.map((s) => {
              const active = s.slug === f.subcategorySlug
              return (
                <Link
                  key={s.slug}
                  href={subcategoryHref(s.slug)}
                  className={`chip chip--count${active ? ' chip--accent' : ''}`}
                  aria-pressed={active}
                >
                  {s.name}
                  <span className="chip__count">{subCount.get(s.slug)}</span>
                </Link>
              )
            })}
          </nav>
        )}
      </div>

      <div className="explorar__shell container">
        <Filters facets={facets} />

        <div className="explorar__main">
          {/* Pill de filtros activos */}
          {activeChips.length > 0 && (
            <div className="active-filters">
              <span className="active-filters__label">Mostrando</span>
              {activeChips.map((chip, i) => (
                <Link key={i} href={chip.href} className="active-chip" aria-label={`Quitar ${chip.label}`}>
                  {chip.label}
                  <span className="active-chip__x" aria-hidden="true">×</span>
                </Link>
              ))}
              <Link href="/explorar" className="active-filters__clear">limpiar</Link>
            </div>
          )}

          {/* Barra de resultados */}
          <div className="results-bar">
            <div className="results-bar__count">
              <strong>{result.total}</strong> {result.total === 1 ? 'lugar' : 'lugares'}
              {activeChips.length === 0 && <span className="results-bar__sort">ordenado por relevancia</span>}
            </div>
            <div className="toggle-group" role="group" aria-label="Vista">
              <Link href={viewHref('grid')} aria-pressed={f.view === 'grid'}><GridIcon /> Grid</Link>
              <Link href={viewHref('lista')} aria-pressed={f.view === 'lista'}><ListIcon /> Lista</Link>
            </div>
          </div>

          {/* Resultados */}
          {result.items.length > 0 ? (
            <>
              <div className={f.view === 'lista' ? 'results-list' : 'results-grid'}>
                {result.items.map((place) => (
                  <PlaceCard key={place.id} place={place} save={save} variant={f.view === 'lista' ? 'list' : 'grid'} />
                ))}
              </div>

              {result.totalPages > 1 && (
                <nav className="pager" aria-label="Paginación">
                  {f.page > 1 && <Link href={pageHref(f.page - 1)} className="btn btn--ghost btn--sm">← Anterior</Link>}
                  <span className="pager__pos">{f.page} / {result.totalPages}</span>
                  {f.page < result.totalPages && <Link href={pageHref(f.page + 1)} className="btn btn--ghost btn--sm">Siguiente →</Link>}
                </nav>
              )}
            </>
          ) : (
            <div className="results-empty">
              <p className="results-empty__title">Sin resultados</p>
              <p className="results-empty__lead">No encontramos lugares con esos filtros. Prueba quitando alguno.</p>
              <Link href="/explorar" className="btn btn--ghost">Ver todos los lugares</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}
function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
