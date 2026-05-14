'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, Suspense } from 'react'
import { NEIGHBORHOODS } from '@domain/shared/Neighborhoods'

const CATEGORIES = [
  { slug: 'restaurantes', name: 'Restaurantes' },
  { slug: 'cafes',        name: 'Cafés' },
  { slug: 'bares',        name: 'Bares' },
  { slug: 'museos',       name: 'Museos' },
  { slug: 'tiendas',      name: 'Tiendas' },
  { slug: 'servicios',    name: 'Servicios' },
]

const PRICE_RANGES = [
  { value: '1', label: '$' },
  { value: '2', label: '$$' },
  { value: '3', label: '$$$' },
  { value: '4', label: '$$$$' },
]

const RATING_OPTIONS = [
  { value: '4', label: '★★★★★', sub: '4+' },
  { value: '3', label: '★★★★',  sub: '3+' },
  { value: '2', label: '★★★',   sub: '2+' },
]

const VISIBLE_NEIGHBORHOODS = NEIGHBORHOODS.slice(0, 10)

interface FilterRailProps {
  totalResults?: number
  categoryCounts?: Record<string, number>
}

function FilterRailInner({ totalResults, categoryCounts }: FilterRailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeCategoria = searchParams.get('categoria') ?? ''
  const activeBarrio    = searchParams.get('barrio') ?? ''
  const activePrecios   = (searchParams.get('precio') ?? '').split(',').filter(Boolean)
  const activeRating    = searchParams.get('rating') ?? ''
  const activePremium   = searchParams.get('premium') === '1'

  const activeCount = [activeCategoria, activeBarrio, activeRating, activePremium]
    .filter(Boolean).length + activePrecios.length

  function push(params: URLSearchParams) {
    params.delete('pagina')
    startTransition(() => {
      router.push(`/explorar?${params.toString()}`)
    })
  }

  function toggleSingle(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (p.get(key) === value) p.delete(key)
    else p.set(key, value)
    push(p)
  }

  function toggleMulti(key: string, value: string, current: string[]) {
    const p = new URLSearchParams(searchParams.toString())
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    if (next.length === 0) p.delete(key)
    else p.set(key, next.join(','))
    push(p)
  }

  function toggleBool(key: string, active: boolean) {
    const p = new URLSearchParams(searchParams.toString())
    if (active) p.delete(key)
    else p.set(key, '1')
    push(p)
  }

  return (
    <aside className="filter-rail" data-pending={isPending || undefined}>

      {/* Header: título + total resultados — visible solo en desktop */}
      <div className="filter-rail__header">
        <span className="eyebrow">Filtros</span>
        {totalResults !== undefined && (
          <p className="filter-rail__total">{totalResults} {totalResults === 1 ? 'resultado' : 'resultados'}</p>
        )}
      </div>

      {/* Toggle visible solo en tablet/móvil */}
      <button
        className="filter-rail__toggle"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
      >
        <span>
          Filtros{activeCount > 0 && (
            <span style={{ marginLeft: 6, background: 'var(--ink-100)', color: 'var(--paper-00)', borderRadius: 'var(--r-pill)', padding: '1px 7px', fontSize: 'var(--t-mono-sm)', fontFamily: 'var(--font-mono)' }}>
              {activeCount}
            </span>
          )}
        </span>
        <svg className="ico-sm" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: mobileOpen ? 'rotate(180deg)' : undefined, transition: 'transform var(--d-fast)' }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className={`filter-rail__body${mobileOpen ? ' is-open' : ''}`}>

      <h5>Categorías</h5>
      {CATEGORIES.map((cat) => (
        <label key={cat.slug}>
          <input
            type="checkbox"
            checked={activeCategoria === cat.slug}
            onChange={() => toggleSingle('categoria', cat.slug)}
          />
          <span>{cat.name}</span>
          {categoryCounts?.[cat.slug] !== undefined && (
            <span className="filter-rail__count">{categoryCounts[cat.slug]}</span>
          )}
        </label>
      ))}

      <h5>Barrios</h5>
      {VISIBLE_NEIGHBORHOODS.map((n) => (
        <label key={n}>
          <input
            type="checkbox"
            checked={activeBarrio === n}
            onChange={() => toggleSingle('barrio', n)}
          />
          <span>{n}</span>
        </label>
      ))}

      <h5>Precio</h5>
      {PRICE_RANGES.map((p) => (
        <label key={p.value}>
          <input
            type="checkbox"
            checked={activePrecios.includes(p.value)}
            onChange={() => toggleMulti('precio', p.value, activePrecios)}
          />
          <span>{p.label}</span>
        </label>
      ))}

      <h5>Valoración</h5>
      {RATING_OPTIONS.map((r) => (
        <label key={r.value}>
          <input
            type="radio"
            name="rating"
            checked={activeRating === r.value}
            onChange={() => toggleSingle('rating', r.value)}
          />
          <span style={{ color: 'var(--accent-60)', letterSpacing: '1px' }}>{r.label}</span>
          <span className="filter-rail__count">{r.sub}</span>
        </label>
      ))}

      <h5>Premium</h5>
      <label>
        <input
          type="checkbox"
          checked={activePremium}
          onChange={() => toggleBool('premium', activePremium)}
        />
        <span>Solo Premium</span>
      </label>

      </div>
    </aside>
  )
}

export function FilterRail(props: FilterRailProps) {
  return (
    <Suspense fallback={<aside className="filter-rail" />}>
      <FilterRailInner {...props} />
    </Suspense>
  )
}
