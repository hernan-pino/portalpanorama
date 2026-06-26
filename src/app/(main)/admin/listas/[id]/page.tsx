import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { container } from '@lib/container'
import { CuratedListNotFoundError } from '@domain/curatedList/errors/CuratedListNotFoundError'
import { CuratedListForm } from '../CuratedListForm'

export const metadata: Metadata = { title: 'Editar lista — Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarListaPage({ params }: PageProps) {
  const { id } = await params

  const [initial, facets, parents] = await Promise.all([
    container
      .getGetCuratedListForEditUseCase()
      .execute(id)
      .catch((e) => {
        if (e instanceof CuratedListNotFoundError) return null
        throw e
      }),
    container.getGetPlaceFacetsUseCase().execute(),
    container.getGetPlaceFormOptionsUseCase().execute().then((o) => o.parents),
  ])
  if (!initial) notFound()

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/listas" className="admin-page__back">← Listas</Link>
          <h1 className="admin-page__title">{initial.name}</h1>
          {initial.isPublished && (
            <p className="admin-page__sub">
              <Link href={`/lista/${initial.slug}`} className="admin-page__back" target="_blank">
                Ver página pública ↗
              </Link>
            </p>
          )}
        </div>
      </header>
      <CuratedListForm facets={facets} places={parents} initial={initial} />
    </div>
  )
}
