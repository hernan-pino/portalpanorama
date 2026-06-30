'use client'
import { useEffect, useRef, useState } from 'react'

// Paginación client-side compartida por las tablas del admin (lugares, marcas,
// listas, usuarios). La data ya viaja completa en el HTML, así que cambiar de
// página es solo cortar el array en el estado: instantáneo, sin red.
export const ADMIN_PAGE_SIZE = 25

export function usePagination<T>(items: T[], pageSize = ADMIN_PAGE_SIZE) {
  const [page, setPage] = useState(1)
  // El ancla a la que saltar al cambiar de página (el tope de la tabla).
  const topRef = useRef<HTMLDivElement>(null)

  // Cuando cambia el conjunto (filtros/búsqueda recalculan `items`), volver a la
  // primera página para no quedar en una página que ya no existe.
  useEffect(() => {
    setPage(1)
  }, [items])

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  function goTo(n: number) {
    setPage(n)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return { page: current, pageCount, pageItems, goTo, topRef, start, pageSize, total: items.length }
}

export function AdminPager({
  page,
  pageCount,
  onChange,
}: {
  page: number
  pageCount: number
  onChange: (n: number) => void
}) {
  if (pageCount <= 1) return null
  return (
    <nav className="pager" aria-label="Paginación">
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        ← Anterior
      </button>
      <span className="pager__pos">{page} / {pageCount}</span>
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => onChange(page + 1)}
        disabled={page === pageCount}
      >
        Siguiente →
      </button>
    </nav>
  )
}
