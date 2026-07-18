'use client'
import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import type { PlaceFacets, FacetCount } from '@application/ports/SearchService'

interface Props {
  facets: PlaceFacets
}

// Panel de filtros (4E §8.2): acordeón colapsable. Desktop = rail lateral; móvil =
// hoja inferior (bottom-sheet) tras el botón "Filtros". Categoría/subcategoría NO
// viven acá: son la franja superior protagonista (§8.1/§8.3). Acá: ¿Con quién vas?
// + Más filtros (gasto · dónde · ambiente · accesibilidad · sin reserva). Las
// opciones ya vienen sin vacíos (los contadores 0 se ocultan en getFacets).
function FiltersInner({ facets }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [sheetOpen, setSheetOpen] = useState(false)

  const get = (key: string) => searchParams.get(key) ?? ''
  const getMulti = (key: string) => get(key).split(',').filter(Boolean)

  function push(p: URLSearchParams) {
    p.delete('pagina')
    startTransition(() => router.push(`/explorar?${p.toString()}`))
  }
  function toggleSingle(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (p.get(key) === value) p.delete(key)
    else p.set(key, value)
    push(p)
  }
  function toggleMulti(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString())
    const cur = getMulti(key)
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]
    if (next.length) p.set(key, next.join(','))
    else p.delete(key)
    push(p)
  }
  function toggleBool(key: string) {
    const p = new URLSearchParams(searchParams.toString())
    if (p.get(key) === '1') p.delete(key)
    else p.set(key, '1')
    push(p)
  }

  // nº de filtros activos por sección (badge en la cabecera del acordeón).
  const socialN = getMulti('con').length
  const ocasionN = getMulti('ocasion').length
  const precioN = getMulti('precio').length
  const dondeN = [get('comuna'), get('barrio'), get('metro')].filter(Boolean).length
  const ambienteN = getMulti('ambiente').length
  const experienciaN = getMulti('experiencia').length
  const accesoN = getMulti('acceso').length
  const reservaN = get('sinreserva') === '1' ? 1 : 0
  const totalN = socialN + ocasionN + precioN + dondeN + ambienteN + experienciaN + accesoN + reservaN

  const body = (
    <div className="filters__body" data-pending={isPending || undefined}>
      <Section title="¿Con quién vas?" count={socialN} defaultOpen={socialN > 0}>
        <ChipSet
          options={facets.social}
          isActive={(v) => getMulti('con').includes(v)}
          onToggle={(v) => toggleMulti('con', v)}
        />
      </Section>

      <Section title="Ideal para" count={ocasionN} defaultOpen={ocasionN > 0}>
        <ChipSet
          options={facets.occasion}
          isActive={(v) => getMulti('ocasion').includes(v)}
          onToggle={(v) => toggleMulti('ocasion', v)}
        />
      </Section>

      <Section title="¿Cuánto gasto?" count={precioN} defaultOpen={precioN > 0}>
        <ChipSet
          options={facets.priceRanges}
          isActive={(v) => getMulti('precio').includes(v)}
          onToggle={(v) => toggleMulti('precio', v)}
        />
      </Section>

      <Section title="¿Dónde?" count={dondeN} defaultOpen={dondeN > 0}>
        {facets.communes.length > 0 && (
          <Subgroup label="Comuna">
            <CollapsibleChipSet
              options={facets.communes}
              isActive={(v) => get('comuna') === v}
              onToggle={(v) => toggleSingle('comuna', v)}
            />
          </Subgroup>
        )}
        {facets.neighborhoods.length > 0 && (
          <Subgroup label="Barrio">
            <CollapsibleChipSet
              options={facets.neighborhoods}
              isActive={(v) => get('barrio') === v}
              onToggle={(v) => toggleSingle('barrio', v)}
            />
          </Subgroup>
        )}
        {facets.metroLines.length > 0 && (
          <Subgroup label="Cerca del metro">
            <ChipSet
              options={facets.metroLines}
              isActive={(v) => get('metro') === v}
              onToggle={(v) => toggleSingle('metro', v)}
            />
          </Subgroup>
        )}
      </Section>

      <Section title="Ambiente" count={ambienteN} defaultOpen={ambienteN > 0}>
        <ChipSet
          options={facets.vibe}
          isActive={(v) => getMulti('ambiente').includes(v)}
          onToggle={(v) => toggleMulti('ambiente', v)}
        />
      </Section>

      <Section title="Experiencia" count={experienciaN} defaultOpen={experienciaN > 0}>
        <ChipSet
          options={facets.experience}
          isActive={(v) => getMulti('experiencia').includes(v)}
          onToggle={(v) => toggleMulti('experiencia', v)}
        />
      </Section>

      <Section title="Accesibilidad" count={accesoN} defaultOpen={accesoN > 0}>
        <ChipSet
          options={facets.access}
          isActive={(v) => getMulti('acceso').includes(v)}
          onToggle={(v) => toggleMulti('acceso', v)}
        />
      </Section>

      <Section title="Reserva" count={reservaN} defaultOpen={reservaN > 0}>
        <button
          type="button"
          className={`chip${get('sinreserva') === '1' ? ' chip--accent' : ''}`}
          aria-pressed={get('sinreserva') === '1'}
          onClick={() => toggleBool('sinreserva')}
        >
          Sin reserva
        </button>
      </Section>

      {/* Ayuda: cómo se ordenan las fichas (bajó desde la barra de resultados, s38) */}
      <Link href="/como-ordenamos" className="filters__how">
        ¿Quieres saber cómo ordenamos las fichas?
      </Link>
    </div>
  )

  return (
    <>
      {/* Rail desktop */}
      <aside className="filters__rail">
        <div className="filters__rail-head">
          <span className="eyebrow">Filtros</span>
        </div>
        {body}
      </aside>

      {/* Trigger móvil → bottom-sheet */}
      <button
        type="button"
        className="filters__trigger"
        onClick={() => setSheetOpen(true)}
        aria-haspopup="dialog"
      >
        <FilterGlyph />
        Filtros
        {totalN > 0 && <span className="filters__trigger-badge">{totalN}</span>}
      </button>

      {sheetOpen && (
        <div className="filters__sheet-scrim" role="presentation" onClick={() => setSheetOpen(false)}>
          <div
            className="filters__sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="filters__sheet-head">
              <strong>Filtros</strong>
              <button type="button" className="filters__sheet-close" aria-label="Cerrar" onClick={() => setSheetOpen(false)}>×</button>
            </div>
            {body}
            <div className="filters__sheet-foot">
              <button type="button" className="btn btn--accent" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setSheetOpen(false)}>
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Subcomponentes ──
function Section({ title, count, defaultOpen, children }: { title: string; count: number; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div className={`filter-acc${open ? ' is-open' : ''}`}>
      <button type="button" className="filter-acc__head" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="filter-acc__title">
          {title}
          {count > 0 && <span className="filter-acc__badge">{count}</span>}
        </span>
        <ChevronGlyph />
      </button>
      {open && <div className="filter-acc__panel">{children}</div>}
    </div>
  )
}

function Subgroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="filter-sub">
      <div className="filter-sub__label">{label}</div>
      {children}
    </div>
  )
}

function ChipSet({
  options,
  isActive,
  onToggle,
  renderLabel,
}: {
  options: FacetCount[]
  isActive: (value: string) => boolean
  onToggle: (value: string) => void
  renderLabel?: (o: FacetCount) => string
}) {
  if (options.length === 0) return <p className="filter-empty">Sin opciones por ahora.</p>
  return (
    <div className="chip-set">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`chip chip--count${isActive(o.value) ? ' chip--accent' : ''}`}
          aria-pressed={isActive(o.value)}
          onClick={() => onToggle(o.value)}
        >
          {renderLabel ? renderLabel(o) : o.label}
          <span className="chip__count">{o.count}</span>
        </button>
      ))}
    </div>
  )
}

// Como ChipSet pero acotado: muestra solo las `limit` opciones con más resultados
// y un link "Ver más" para revelar el resto (Comuna/Barrio tienen muchas opciones).
// Se ordena por count desc para garantizar que las visibles sean las top. Si la
// opción activa quedara oculta, arranca expandido para no esconder la selección.
function CollapsibleChipSet({
  options,
  isActive,
  onToggle,
  limit = 3,
}: {
  options: FacetCount[]
  isActive: (value: string) => boolean
  onToggle: (value: string) => void
  limit?: number
}) {
  const sorted = [...options].sort((a, b) => b.count - a.count)
  const activeHidden = sorted.findIndex((o) => isActive(o.value)) >= limit
  const [expanded, setExpanded] = useState(activeHidden)

  if (sorted.length === 0) return <p className="filter-empty">Sin opciones por ahora.</p>

  const visible = expanded ? sorted : sorted.slice(0, limit)
  const hiddenCount = sorted.length - limit

  return (
    <>
      <div className="chip-set">
        {visible.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`chip chip--count${isActive(o.value) ? ' chip--accent' : ''}`}
            aria-pressed={isActive(o.value)}
            onClick={() => onToggle(o.value)}
          >
            {o.label}
            <span className="chip__count">{o.count}</span>
          </button>
        ))}
      </div>
      {hiddenCount > 0 && (
        <button type="button" className="filter-more" onClick={() => setExpanded((e) => !e)}>
          {expanded ? 'Ver menos' : `Ver más (${hiddenCount})`}
        </button>
      )}
    </>
  )
}

function ChevronGlyph() {
  return (
    <svg className="filter-acc__chev" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  )
}
function FilterGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M3 5.5h14M5.5 10h9M8 14.5h4" />
    </svg>
  )
}

export function Filters(props: Props) {
  return (
    <Suspense fallback={<aside className="filters__rail" />}>
      <FiltersInner {...props} />
    </Suspense>
  )
}
