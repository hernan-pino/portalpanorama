'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

// Búsqueda libre por texto. Es la entrada a explorar (4E §6.1). El "dónde/cuándo"
// salió de acá: el lugar se acota con los filtros de facetas (comuna/barrio/metro)
// y "cuándo" depende de eventos (apagados en el MVP). Preserva los filtros vigentes
// al enviar (solo cambia q).
function SearchBarInner({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(compact ? searchParams.toString() : '')
    const q = query.trim()
    if (q) params.set('q', q)
    else params.delete('q')
    params.delete('pagina')
    router.push(`/explorar?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="searchbar" role="search">
      <svg className="searchbar__ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <circle cx="8.5" cy="8.5" r="5.5" /><path d="M16.5 16.5l-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Qué comer, tomar o hacer hoy…"
        aria-label="Buscar lugares"
        autoComplete="off"
      />
      <button type="submit" className="searchbar__btn">Buscar</button>
    </form>
  )
}

export function SearchBar(props: { compact?: boolean }) {
  return (
    <Suspense fallback={<div className="searchbar" />}>
      <SearchBarInner {...props} />
    </Suspense>
  )
}
