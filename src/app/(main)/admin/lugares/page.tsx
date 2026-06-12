import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'
import { STATUS_LABELS } from './types'
import { PlaceRowActions } from './PlaceRowActions'

export const metadata: Metadata = { title: 'Lugares — Admin' }

export default async function LugaresPage() {
  const places = await container.getListPlacesForAdminUseCase().execute()

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-page__title">Lugares</h1>
          <p className="admin-page__sub">{places.length} en total</p>
        </div>
        <Link href="/admin/lugares/nuevo" className="btn btn--primary">+ Nuevo lugar</Link>
      </header>

      {places.length === 0 ? (
        <p className="admin-empty">
          Todavía no hay lugares. <Link href="/admin/lugares/nuevo">Creá el primero</Link>.
        </p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Comuna</th>
                <th>Google</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {places.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/lugares/${p.id}`} className="admin-table__name">{p.name}</Link>
                  </td>
                  <td>{p.categoryName}</td>
                  <td>{p.communeName}</td>
                  <td>{p.googleRating != null ? `★ ${p.googleRating.toFixed(1)}` : '—'}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${p.status.toLowerCase()}`}>
                      {STATUS_LABELS[p.status] ?? p.status}
                    </span>
                  </td>
                  <td>
                    <PlaceRowActions id={p.id} status={p.status} />
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
