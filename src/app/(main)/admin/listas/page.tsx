import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'
import { CuratedListsAdminList, type CuratedListAdminRow } from './CuratedListsAdminList'

export const metadata: Metadata = { title: 'Listas curadas — Admin' }

export default async function ListasPage() {
  const lists = await container.getListCuratedListsForAdminUseCase().execute()

  const rows: CuratedListAdminRow[] = lists.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    kind: l.kind,
    pinCount: l.pinCount,
    isPublished: l.isPublished,
  }))

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-page__title">Listas curadas</h1>
          <p className="admin-page__sub">{lists.length} en total</p>
        </div>
        <Link href="/admin/listas/nuevo" className="btn btn--primary">+ Nueva lista</Link>
      </header>

      {rows.length === 0 ? (
        <p className="admin-empty">
          Todavía no hay listas. <Link href="/admin/listas/nuevo">Crea la primera</Link>.
        </p>
      ) : (
        <CuratedListsAdminList lists={rows} />
      )}
    </div>
  )
}
