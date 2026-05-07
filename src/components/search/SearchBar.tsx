'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { NEIGHBORHOODS } from '@domain/shared/Neighborhoods'

function SearchBarInner({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [barrio, setBarrio] = useState(searchParams.get('barrio') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (barrio) params.set('barrio', barrio)
    router.push(`/explorar?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="hero-search" style={compact ? { maxWidth: '600px' } : undefined}>
      <div className="hero-search__field">
        <label>Qué</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Restaurante, café, bar…"
          autoComplete="off"
        />
      </div>
      <div className="hero-search__field">
        <label>Dónde</label>
        <select value={barrio} onChange={(e) => setBarrio(e.target.value)}>
          <option value="">Todo Santiago</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      {!compact && (
        <div className="hero-search__field">
          <label>Cuándo</label>
          <select defaultValue="">
            <option value="">Cualquier momento</option>
            <option value="ahora">Ahora abierto</option>
            <option value="noche">Esta noche</option>
            <option value="finde">Este fin de semana</option>
          </select>
        </div>
      )}
      <button type="submit" className="hero-search__btn" aria-label="Buscar">
        <svg className="ico ico-lg" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
        </svg>
      </button>
    </form>
  )
}

export function SearchBar(props: { compact?: boolean }) {
  return (
    <Suspense>
      <SearchBarInner {...props} />
    </Suspense>
  )
}
