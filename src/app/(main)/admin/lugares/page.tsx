import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'
import { PlacesAdminList, type AdminRow } from './PlacesAdminList'

export const metadata: Metadata = { title: 'Lugares — Admin' }

export default async function LugaresPage() {
  const places = await container.getListPlacesForAdminUseCase().execute()

  // Subconjunto serializable que necesita la tabla (sin Date ni score).
  const rows: AdminRow[] = places.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    categoryName: p.categoryName,
    communeName: p.communeName,
    googleRating: p.googleRating,
    visitCount: p.visitCount,
    saveCount: p.saveCount,
  }))

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
          Todavía no hay lugares. <Link href="/admin/lugares/nuevo">Crea el primero</Link>.
        </p>
      ) : (
        <PlacesAdminList places={rows} />
      )}
    </div>
  )
}
