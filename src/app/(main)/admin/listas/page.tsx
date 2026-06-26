import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'
import { CuratedListRowActions } from './CuratedListRowActions'

export const metadata: Metadata = { title: 'Listas curadas — Admin' }

const KIND_LABEL: Record<string, string> = { GUIDE: 'Guía', OCCASION: 'Ocasión' }

export default async function ListasPage() {
  const lists = await container.getListCuratedListsForAdminUseCase().execute()

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

      {lists.length === 0 ? (
        <p className="admin-empty">
          Todavía no hay listas. <Link href="/admin/listas/nuevo">Crea la primera</Link>.
        </p>
      ) : (
        <div className="admin-table">
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
              {lists.map((l) => (
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
        </div>
      )}
    </div>
  )
}
