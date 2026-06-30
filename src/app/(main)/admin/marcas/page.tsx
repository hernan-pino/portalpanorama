import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'
import { BrandsAdminList, type BrandAdminRow } from './BrandsAdminList'

export const metadata: Metadata = { title: 'Marcas — Admin' }

export default async function MarcasPage() {
  const brands = await container.getListBrandsForAdminUseCase().execute()

  const rows: BrandAdminRow[] = brands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    placeCount: b.placeCount,
  }))

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

      {rows.length === 0 ? (
        <p className="admin-empty">
          Todavía no hay marcas. <Link href="/admin/marcas/nuevo">Crea la primera</Link>.
        </p>
      ) : (
        <BrandsAdminList brands={rows} />
      )}
    </div>
  )
}
