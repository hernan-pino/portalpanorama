import type { Metadata } from 'next'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { container } from '@lib/container'
import { ClaimRow } from './ClaimRow'

export const metadata: Metadata = { title: 'Claims pendientes — Admin' }

export default async function AdminClaimsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const useCase = container.getGetPendingClaimsUseCase()
  const { claims } = await useCase.execute(session.user.id)

  return (
    <main style={{ padding: 'var(--s-8) var(--s-10)' }}>
      <h1 className="h2" style={{ marginBottom: 'var(--s-6)' }}>
        Claims pendientes
      </h1>

      {claims.length === 0 ? (
        <p style={{ color: 'var(--fg-muted)' }}>No hay claims pendientes.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
          {claims.map((claim) => (
            <ClaimRow key={claim.claimId} claim={claim} />
          ))}
        </div>
      )}
    </main>
  )
}
