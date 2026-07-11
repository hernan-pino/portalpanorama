'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { approveClaimAction, rejectClaimAction } from './actions'

export interface ClaimView {
  id: string
  targetType: 'PLACE' | 'BRAND'
  targetName: string
  targetSlug: string
  claimantName: string
  claimantEmail: string
  claimantRole: string | null
  message: string | null
  contactEmail: string | null
  contactPhone: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewNotes: string | null
  createdAt: string
}

const STATUS_LABELS: Record<ClaimView['status'], string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
}

const STATUS_CLASS: Record<ClaimView['status'], string> = {
  PENDING: 'pending_review',
  APPROVED: 'published',
  REJECTED: 'archived',
}

const dateFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })

export function ClaimsInbox({ claims }: { claims: ClaimView[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  // Reclamo con el panel de decisión abierto (para escribir el motivo/nota).
  const [deciding, setDeciding] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  function run(action: typeof approveClaimAction, id: string) {
    setError(null)
    startTransition(async () => {
      const result = await action(id, notes || undefined)
      if ('error' in result) { setError(result.error); return }
      setDeciding(null)
      setNotes('')
      router.refresh()
    })
  }

  return (
    <>
      {error && <p className="admin-row-actions__error" role="alert">{error}</p>}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Ficha reclamada</th>
              <th>Quién</th>
              <th>Rol</th>
              <th>Mensaje</th>
              <th>Contacto</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link
                    href={c.targetType === 'PLACE' ? `/lugar/${c.targetSlug}` : `/marca/${c.targetSlug}`}
                    className="admin-table__name"
                    target="_blank"
                  >
                    {c.targetName}
                  </Link>
                  {c.targetType === 'BRAND' && <span className="admin-table__hint"> (marca)</span>}
                </td>
                <td>
                  {c.claimantName}
                  <br />
                  <span style={{ color: 'var(--fg-muted)' }}>{c.claimantEmail}</span>
                </td>
                <td>{c.claimantRole ?? '—'}</td>
                <td className="admin-inbox__msg">{c.message || '—'}</td>
                <td>
                  {c.contactEmail ?? '—'}
                  {c.contactPhone && (<><br />{c.contactPhone}</>)}
                </td>
                <td>{dateFmt.format(new Date(c.createdAt))}</td>
                <td>
                  <span className={`admin-badge admin-badge--${STATUS_CLASS[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                  {c.reviewNotes && (
                    <div style={{ color: 'var(--fg-muted)', marginTop: 4, maxWidth: 200 }}>{c.reviewNotes}</div>
                  )}
                </td>
                <td>
                  {c.status === 'PENDING' && deciding !== c.id && (
                    <button
                      className="btn btn--ghost btn--sm"
                      disabled={isPending}
                      onClick={() => { setDeciding(c.id); setNotes('') }}
                    >
                      Revisar
                    </button>
                  )}
                  {deciding === c.id && (
                    <div className="admin-row-actions" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--s-2)', minWidth: 220 }}>
                      <textarea
                        className="form-input"
                        rows={2}
                        maxLength={1000}
                        placeholder="Nota o motivo (viaja en el correo al reclamante)…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
                        <button className="btn btn--primary btn--sm" disabled={isPending}
                          onClick={() => run(approveClaimAction, c.id)}>
                          {isPending ? '…' : 'Aprobar'}
                        </button>
                        <button className="btn btn--ghost btn--sm" disabled={isPending}
                          onClick={() => run(rejectClaimAction, c.id)}>
                          Rechazar
                        </button>
                        <button className="btn btn--ghost btn--sm" disabled={isPending}
                          onClick={() => setDeciding(null)}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
