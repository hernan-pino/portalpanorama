import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { container } from '@lib/container'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceForm } from '../PlaceForm'
import { STATUS_LABELS } from '../types'

export const metadata: Metadata = { title: 'Editar lugar — Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarLugarPage({ params }: PageProps) {
  const { id } = await params

  const [options, initial] = await Promise.all([
    container.getGetPlaceFormOptionsUseCase().execute(),
    container
      .getGetPlaceForEditUseCase()
      .execute(id)
      .catch((e) => {
        if (e instanceof PlaceNotFoundError) return null
        throw e
      }),
  ])
  if (!initial) notFound()

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/lugares" className="admin-page__back">← Lugares</Link>
          <h1 className="admin-page__title">{initial.name}</h1>
          <p className="admin-page__sub">
            <span className={`admin-badge admin-badge--${initial.status.toLowerCase()}`}>
              {STATUS_LABELS[initial.status] ?? initial.status}
            </span>
            {initial.status === 'PUBLISHED' && (
              <>
                {' · '}
                <Link href={`/lugar/${initial.slug}`} className="admin-page__back" target="_blank">
                  Ver ficha pública ↗
                </Link>
              </>
            )}
          </p>
        </div>
      </header>
      <PlaceForm options={options} initial={initial} />
    </div>
  )
}
