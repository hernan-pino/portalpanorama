'use client'
import Link from 'next/link'
import { CuratedListRowActions } from './CuratedListRowActions'
import { AdminPager, usePagination } from '../_lib/pagination'

const KIND_LABEL: Record<string, string> = { GUIDE: 'Guía', OCCASION: 'Ocasión' }

// Subconjunto serializable que necesita la tabla de listas curadas.
export interface CuratedListAdminRow {
  id: string
  name: string
  slug: string
  kind: string
  pinCount: number
  isPublished: boolean
}

export function CuratedListsAdminList({ lists }: { lists: CuratedListAdminRow[] }) {
  const { pageItems, page, pageCount, goTo, topRef } = usePagination(lists)

  return (
    <div className="admin-table" ref={topRef}>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Destacados</th>
            <th>Estado</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {pageItems.map((l) => (
            <tr key={l.id}>
              <td>
                <Link href={`/admin/listas/${l.id}`} className="admin-table__name">{l.name}</Link>
              </td>
              <td>{KIND_LABEL[l.kind] ?? l.kind}</td>
              <td>{l.pinCount}</td>
              <td>
                <span className={`admin-badge admin-badge--${l.isPublished ? 'published' : 'pending_review'}`}>
                  {l.isPublished ? 'Publicada' : 'Borrador'}
                </span>
              </td>
              <td>
                <CuratedListRowActions
                  id={l.id}
                  name={l.name}
                  slug={l.slug}
                  isPublished={l.isPublished}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AdminPager page={page} pageCount={pageCount} onChange={goTo} />
    </div>
  )
}
