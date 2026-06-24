import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'

export const metadata: Metadata = { title: 'Marcas — Admin' }

export default async function MarcasPage() {
  const brands = await container.getListBrandsForAdminUseCase().execute()

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-page__title">Marcas</h1>
          <p className="admin-page__sub">{brands.length} en total</p>
        </div>
        <Link href="/admin/marcas/nuevo" className="btn btn--primary">+ Nueva marca</Link>
      </header>

      {brands.length === 0 ? (
        <p className="admin-empty">
          Todavía no hay marcas. <Link href="/admin/marcas/nuevo">Crea la primera</Link>.
        </p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Locales</th>
                <th aria-label="Ver" />
              </tr>
            </thead>
            <tbody>
              {brands.map((b) => (
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
        </div>
      )}
    </div>
  )
}
