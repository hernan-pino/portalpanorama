import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { container } from '@lib/container'
import { BrandNotFoundError } from '@domain/brand/errors/BrandNotFoundError'
import { BrandForm } from '../BrandForm'

export const metadata: Metadata = { title: 'Editar marca — Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarMarcaPage({ params }: PageProps) {
  const { id } = await params

  const initial = await container
    .getGetBrandForEditUseCase()
    .execute(id)
    .catch((e) => {
      if (e instanceof BrandNotFoundError) return null
      throw e
    })
  if (!initial) notFound()

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/marcas" className="admin-page__back">← Marcas</Link>
          <h1 className="admin-page__title">{initial.name}</h1>
          <p className="admin-page__sub">
            <Link href={`/marca/${initial.slug}`} className="admin-page__back" target="_blank">
              Ver página pública ↗
            </Link>
          </p>
        </div>
      </header>
      <BrandForm initial={initial} />
    </div>
  )
}
