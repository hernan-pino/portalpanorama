'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setReportStatusAction } from './actions'

export interface ReportView {
  id: string
  placeName: string
  placeSlug: string
  reason: 'WRONG_INFO' | 'CLOSED' | 'DUPLICATE' | 'OTHER'
  message: string | null
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED'
  reporterEmail: string | null
  createdAt: string
}

const REASON_LABELS: Record<ReportView['reason'], string> = {
  WRONG_INFO: 'Dato incorrecto',
  CLOSED: 'Lugar cerrado',
  DUPLICATE: 'Duplicado',
  OTHER: 'Otro',
}

const STATUS_LABELS: Record<ReportView['status'], string> = {
  OPEN: 'Abierto',
  RESOLVED: 'Resuelto',
  DISMISSED: 'Descartado',
}

const STATUS_CLASS: Record<ReportView['status'], string> = {
  OPEN: 'pending_review',
  RESOLVED: 'published',
  DISMISSED: 'archived',
}

const dateFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })

export function ReportsInbox({ reports }: { reports: ReportView[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function run(id: string, status: ReportView['status']) {
    setError(null)
    startTransition(async () => {
      const result = await setReportStatusAction(id, status)
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <>
      {error && <p className="admin-row-actions__error" role="alert">{error}</p>}
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>Lugar</th>
              <th>Motivo</th>
              <th>Mensaje</th>
              <th>Quién</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/lugar/${r.placeSlug}`} className="admin-table__name" target="_blank">
                    {r.placeName}
                  </Link>
                </td>
                <td>{REASON_LABELS[r.reason]}</td>
                <td className="admin-inbox__msg">{r.message || '—'}</td>
                <td>{r.reporterEmail ?? 'Anónimo'}</td>
                <td>{dateFmt.format(new Date(r.createdAt))}</td>
                <td>
                  <span className={`admin-badge admin-badge--${STATUS_CLASS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
                <td>
                  <div className="admin-row-actions">
                    {r.status !== 'RESOLVED' && (
                      <button className="btn btn--ghost btn--sm" disabled={isPending}
                        onClick={() => run(r.id, 'RESOLVED')}>Resolver</button>
                    )}
                    {r.status === 'OPEN' && (
                      <button className="btn btn--ghost btn--sm" disabled={isPending}
                        onClick={() => run(r.id, 'DISMISSED')}>Descartar</button>
                    )}
                    {r.status !== 'OPEN' && (
                      <button className="btn btn--ghost btn--sm" disabled={isPending}
                        onClick={() => run(r.id, 'OPEN')}>Reabrir</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
