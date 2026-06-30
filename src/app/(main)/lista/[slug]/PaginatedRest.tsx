'use client'
import { useRef, useState } from 'react'
import { PlaceCard, type SaveContext } from '@components/place/PlaceCard'
import type { PlaceCardView } from '@application/ports/PlaceRepository'

// Paginación 100% client-side del "resto" de la guía (los lugares que no son
// destacados ni menciones). Toda la data ya viaja en el HTML (la regla se resolvió
// en el server), así que cambiar de página es solo cortar el array en el estado:
// instantáneo, sin red, sin recargar. Las tarjetas siguen TODAS en el DOM para el
// usuario que avanza, pero solo se renderiza la página visible. SEO: la grilla
// completa ya está en el server-render de la página (esto solo afecta el cliente).
const PAGE_SIZE = 12

export function PaginatedRest({ places, save }: { places: PlaceCardView[]; save: SaveContext }) {
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(places.length / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const visible = places.slice(start, start + PAGE_SIZE)

  function goTo(n: number) {
    setPage(n)
    // Al cambiar de página, llevar el inicio de la grilla al tope del viewport
    // (si no, quedarías a mitad de scroll viendo tarjetas nuevas desde abajo).
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <div ref={topRef} className="results-grid">
        {visible.map((place) => (
          <PlaceCard key={place.id} place={place} save={save} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="pager" aria-label="Paginación de la lista">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
          >
            ← Anterior
          </button>
          <span className="pager__pos">{page} / {totalPages}</span>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
          >
            Siguiente →
          </button>
        </nav>
      )}
    </>
  )
}
