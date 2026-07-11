import type { Metadata } from 'next'
import { container } from '@lib/container'
import { ClaimsInbox, type ClaimView } from './ClaimsInbox'

export const metadata: Metadata = { title: 'Reclamos de negocio — Admin' }

export default async function ReclamosPage() {
  const claims = await container.getListBusinessClaimsForAdminUseCase().execute()

  const rows: ClaimView[] = claims.map((c) => ({
    id: c.id,
    targetType: c.targetType,
    targetName: c.targetName,
    targetSlug: c.targetSlug,
    claimantName: c.claimantName,
    claimantEmail: c.claimantEmail,
    claimantRole: c.claimantRole,
    message: c.message,
    contactEmail: c.contactEmail,
    contactPhone: c.contactPhone,
    status: c.status,
    reviewNotes: c.reviewNotes,
    createdAt: c.createdAt.toISOString(),
  }))

  const pending = rows.filter((r) => r.status === 'PENDING').length

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-page__title">Reclamos de negocio</h1>
          <p className="admin-page__sub">
            {pending} reclamo{pending === 1 ? '' : 's'} pendiente{pending === 1 ? '' : 's'} de
            revisión · Al aprobar, la ficha queda asociada al reclamante y se le avisa por correo.
          </p>
        </div>
      </header>

      <section className="admin-inbox-section">
        {rows.length === 0 ? (
          <p className="admin-empty">Aún no hay reclamos. Llegan desde el botón “Reclamar esta ficha” de cada lugar.</p>
        ) : (
          <ClaimsInbox claims={rows} />
        )}
      </section>
    </div>
  )
}
