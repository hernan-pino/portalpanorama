import type { Metadata } from 'next'
import Link from 'next/link'
import { container } from '@lib/container'
import { PlaceForm } from '../PlaceForm'

export const metadata: Metadata = { title: 'Nuevo lugar — Admin' }

export default async function NuevoLugarPage() {
  const options = await container.getGetPlaceFormOptionsUseCase().execute()

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <Link href="/admin/lugares" className="admin-page__back">← Lugares</Link>
          <h1 className="admin-page__title">Nuevo lugar</h1>
          <p className="admin-page__sub">Nace en revisión; se publica después desde la lista.</p>
        </div>
      </header>
      <PlaceForm options={options} />
    </div>
  )
}
