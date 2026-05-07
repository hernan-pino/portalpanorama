import type { Metadata } from 'next'
import { container } from '@lib/container'
import { CreateListingForm } from './CreateListingForm'

export const metadata: Metadata = { title: 'Nuevo listing' }

export default async function NuevoListingPage() {
  const categories = await container.getCategories()

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)', maxWidth: '640px' }}>
      <h1
        className="display"
        style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}
      >
        Nuevo listing
      </h1>
      <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-8)' }}>
        Completá los datos básicos. Podés editar todo después.
      </p>

      <CreateListingForm categories={categories} />
    </div>
  )
}
