import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'
import { CuratedListForm } from '../CuratedListForm'

export const metadata: Metadata = { title: 'Nueva lista — Admin' }

export default async function NuevaListaPage() {
  // Facetas (vocabulario de la regla, en slugs) + lugares (picker de destacados).
  const [facets, parents] = await Promise.all([
    container.getGetPlaceFacetsUseCase().execute(),
    container.getGetPlaceFormOptionsUseCase().execute().then((o) => o.parents),
  ])

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/listas" className="admin-page__back">← Listas</Link>
          <h1 className="admin-page__title">Nueva lista curada</h1>
          <p className="admin-page__sub">Una regla (filtros) + destacados a mano = una landing de guía/ocasión.</p>
        </div>
      </header>
      <CuratedListForm facets={facets} places={parents} />
    </div>
  )
}
