'use client'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useRef, useEffect, Suspense } from 'react'
import { trackEvent } from '@lib/analytics'

interface Suggestion {
  slug: string
  name: string
  categoryName: string
  communeName: string
  coverUrl?: string
}

// Búsqueda libre + autocompletado (4E §6.1). Mientras escribís, consulta
// /api/suggest (con debounce) y muestra lugares que matchean de forma tolerante
// (parcial + sin acentos + typos). Enter sobre una sugerencia → ficha; Enter sin
// elegir → explorar con ese texto (que tampoco da 0 resultados por el match fuzzy).
// Preserva los filtros vigentes al buscar en modo compacto (solo cambia q).
function SearchBarInner({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const touched = useRef(false)

  // Fetch con debounce. No corre en el montaje (touched) para que en explorar,
  // donde el input ya trae el q de la URL, no se abra el dropdown solo.
  useEffect(() => {
    if (!touched.current) return
    const q = query.trim()
    if (q.length < 2) { setSuggestions([]); setOpen(false); return }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        const data = await res.json()
        setSuggestions(data.suggestions ?? [])
        setActive(-1)
        setOpen(true)
      } catch { /* abortado: lo reemplaza la siguiente consulta */ }
    }, 250)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [query])

  // Cerrar al hacer click fuera.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function goSearch(q: string) {
    const params = new URLSearchParams(compact ? searchParams.toString() : '')
    const v = q.trim()
    if (v) { params.set('q', v); trackEvent('buscar', { search_term: v, tipo: 'texto' }) }
    else params.delete('q')
    params.delete('pagina')
    setOpen(false)
    router.push(`/explorar?${params.toString()}`)
  }

  function goPlace(slug: string) {
    const term = query.trim()
    if (term) trackEvent('buscar', { search_term: term, tipo: 'sugerencia', slug })
    setOpen(false)
    router.push(`/lugar/${slug}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (open && active >= 0 && suggestions[active]) goPlace(suggestions[active].slug)
    else goSearch(query)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, suggestions.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, -1)) }
    else if (e.key === 'Escape') { setOpen(false); setActive(-1) }
  }

  return (
    <div className="searchbox" ref={rootRef}>
      <form onSubmit={handleSubmit} className="searchbar" role="search">
        <svg className="searchbar__ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" /><path d="M16.5 16.5l-3.5-3.5" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => { touched.current = true; setQuery(e.target.value) }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
          placeholder="Qué comer, tomar o hacer hoy…"
          aria-label="Buscar lugares"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-activedescendant={active >= 0 ? `suggestion-${active}` : undefined}
        />
        <button type="submit" className="searchbar__btn">Buscar</button>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="searchbox__menu" id="search-suggestions" role="listbox" aria-label="Sugerencias">
          {suggestions.map((s, i) => (
            <li
              key={s.slug}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === active}
              className={`searchbox__item${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              // mousedown (no click) para adelantarse al blur del input.
              onMouseDown={(e) => { e.preventDefault(); goPlace(s.slug) }}
            >
              <span className="searchbox__thumb">
                {s.coverUrl
                  ? <Image src={s.coverUrl} alt="" width={40} height={40} sizes="40px" style={{ objectFit: 'cover' }} />
                  : <span className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />}
              </span>
              <span className="searchbox__text">
                <span className="searchbox__name">{s.name}</span>
                <span className="searchbox__meta">{s.categoryName} · {s.communeName}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function SearchBar(props: { compact?: boolean }) {
  return (
    <Suspense fallback={<div className="searchbar" />}>
      <SearchBarInner {...props} />
    </Suspense>
  )
}
