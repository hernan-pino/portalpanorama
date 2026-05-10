import type { Metadata } from 'next'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { container } from '@lib/container'
import { TagRow } from './TagRow'

export const metadata: Metadata = { title: 'Tags pendientes — Admin' }

export default async function AdminTagsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const useCase = container.getGetPendingTagsUseCase()
  const { tags } = await useCase.execute(session.user.id)

  return (
    <main style={{ padding: 'var(--s-8) var(--s-10)' }}>
      <h1 className="h2" style={{ marginBottom: 'var(--s-6)' }}>
        Tags pendientes
      </h1>

      {tags.length === 0 ? (
        <p style={{ color: 'var(--fg-muted)' }}>No hay tags pendientes de aprobación.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          {tags.map((tag) => (
            <TagRow key={tag.tagId} tag={tag} />
          ))}
        </div>
      )}
    </main>
  )
}
