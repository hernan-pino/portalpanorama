'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { STATUS_LABELS } from './types'
import { PlaceRowActions } from './PlaceRowActions'
import { AdminPager, usePagination } from '../_lib/pagination'

// Fila que necesita la tabla del admin (subconjunto serializable de PlaceAdminRow).
export interface AdminRow {
  id: string
  name: string
  status: string
  categoryName: string
  communeName: string
  googleRating?: number
  visitCount: number
  saveCount: number
}

// Filtro de estado. "ACTIVOS" = todo lo que no está archivado (el default): así los
// archivados no se mezclan con el resto y quedan en su propia pestaña.
type StatusFilter = 'ACTIVOS' | 'PENDING_REVIEW' | 'PUBLISHED' | 'ARCHIVED'

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'ACTIVOS', label: 'Activos' },
  { value: 'PENDING_REVIEW', label: 'En revisión' },
  { value: 'PUBLISHED', label: 'Publicados' },
  { value: 'ARCHIVED', label: 'Archivados' },
]

export function PlacesAdminList({ places }: { places: AdminRow[] }) {
  const [status, setStatus] = useState<StatusFilter>('ACTIVOS')
  const [category, setCategory] = useState<string>('')
  const [query, setQuery] = useState<string>('')

  // Categorías presentes en los datos, para el dropdown (sin query extra).
  const categories = useMemo(
    () => [...new Set(places.map((p) => p.categoryName))].sort((a, b) => a.localeCompare(b, 'es')),
    [places],
  )

  // Conteos por estado para los badges de las pestañas.
  const counts = useMemo(() => {
    const c = { ACTIVOS: 0, PENDING_REVIEW: 0, PUBLISHED: 0, ARCHIVED: 0 }
    for (const p of places) {
      if (p.status === 'ARCHIVED') c.ARCHIVED++
      else c.ACTIVOS++
      if (p.status === 'PENDING_REVIEW') c.PENDING_REVIEW++
      if (p.status === 'PUBLISHED') c.PUBLISHED++
    }
    return c
  }, [places])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return places.filter((p) => {
      const matchesStatus = status === 'ACTIVOS' ? p.status !== 'ARCHIVED' : p.status === status
      const matchesCategory = !category || p.categoryName === category
      const matchesQuery = !q || p.name.toLowerCase().includes(q)
      return matchesStatus && matchesCategory && matchesQuery
    })
  }, [places, status, category, query])

  const { pageItems, page, pageCount, goTo, topRef } = usePagination(filtered)

  return (
    <>
      <div className="admin-filters">
        <div className="admin-filters__tabs" role="tablist" aria-label="Filtrar por estado">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={status === t.value}
              className={`admin-filters__tab${status === t.value ? ' is-active' : ''}`}
              onClick={() => setStatus(t.value)}
            >
              {t.label} <span className="admin-filters__count">{counts[t.value]}</span>
            </button>
          ))}
        </div>
        <div className="admin-filters__controls">
          <input
            type="search"
            className="admin-filters__search"
            placeholder="Buscar por nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar por nombre"
          />
          <select
            className="admin-filters__select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="admin-page__sub">
        {filtered.length} {filtered.length === 1 ? 'lugar' : 'lugares'}
        {status === 'ARCHIVED' ? ' archivados' : ''}
      </p>

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay lugares que coincidan con el filtro.</p>
      ) : (
        <div className="admin-table" ref={topRef}>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Comuna</th>
                <th>Google</th>
                <th title="Visitas de usuarios registrados">Visitas</th>
                <th title="Veces guardado en una lista">Guardados</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/lugares/${p.id}`} className="admin-table__name">{p.name}</Link>
                  </td>
                  <td>{p.categoryName}</td>
                  <td>{p.communeName}</td>
                  <td>{p.googleRating != null ? `★ ${p.googleRating.toFixed(1)}` : '—'}</td>
                  <td>{p.visitCount > 0 ? p.visitCount : '—'}</td>
                  <td>{p.saveCount > 0 ? p.saveCount : '—'}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${p.status.toLowerCase()}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td>
                    <PlaceRowActions id={p.id} name={p.name} status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <AdminPager page={page} pageCount={pageCount} onChange={goTo} />
        </div>
      )}
    </>
  )
}
