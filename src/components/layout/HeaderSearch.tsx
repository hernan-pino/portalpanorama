'use client'
import { useEffect, useRef, useState } from 'react'
import { SearchBar } from '@/components/search/SearchBar'

// Buscador del header: un ícono que despliega la búsqueda real (la misma con
// autocompletado de /explorar). Va plegado para no competir con el buscador grande
// de la home ni robarle aire a la nav.
export function HeaderSearch() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Al abrir, el foco va al input: se puede buscar tecleando al tiro.
  useEffect(() => {
    if (open) rootRef.current?.querySelector('input')?.focus()
  }, [open])

  return (
    <div className="topbar__search" ref={rootRef}>
      <button
        type="button"
        className="topbar__icon-btn"
        aria-label="Buscar"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5" /><path d="M16.5 16.5l-3.5-3.5" />
        </svg>
      </button>

      {open && (
        <div className="topbar__search-panel">
          <SearchBar />
        </div>
      )}
    </div>
  )
}
