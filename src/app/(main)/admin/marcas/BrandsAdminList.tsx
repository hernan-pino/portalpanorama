'use client'
import Link from 'next/link'
import { AdminPager, usePagination } from '../_lib/pagination'

// Subconjunto serializable que necesita la tabla de marcas.
export interface BrandAdminRow {
  id: string
  name: string
  slug: string
  placeCount: number
}

export function BrandsAdminList({ brands }: { brands: BrandAdminRow[] }) {
  const { pageItems, page, pageCount, goTo, topRef } = usePagination(brands)

  return (
    <div className="admin-table" ref={topRef}>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Locales</th>
            <th aria-label="Ver" />
          </tr>
        </thead>
        <tbody>
          {pageItems.map((b) => (
            <tr key={b.id}>
              <td>
                <Link href={`/admin/marcas/${b.id}`} className="admin-table__name">{b.name}</Link>
              </td>
              <td>{b.placeCount}</td>
              <td>
                <Link href={`/marca/${b.slug}`} className="btn btn--ghost btn--sm" target="_blank" rel="noopener noreferrer">
                  Ver página ↗
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AdminPager page={page} pageCount={pageCount} onChange={goTo} />
    </div>
  )
}
