'use client'

import { useState } from 'react'
import { resolveClaimAction } from './actions'

interface ClaimRowProps {
  claimId: string
  listingId: string
  listingName: string
  listingSlug: string
  claimantId: string
  claimantName: string
  claimantEmail: string
  message?: string
  createdAt: Date
}

export function ClaimRow({ claim }: { claim: ClaimRowProps }) {
  const [reviewNote, setReviewNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  async function handleResolve(decision: 'APPROVE' | 'REJECT') {
    setLoading(true)
    setResult(null)
    const res = await resolveClaimAction(claim.claimId, decision, reviewNote || undefined)
    setResult(res)
    setLoading(false)
  }

  if (result?.success) {
    return (
      <div
        style={{
          padding: 'var(--s-5)',
          border: '1px solid var(--surface-line)',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-raised)',
          color: 'var(--fg-muted)',
          fontSize: 'var(--t-body-sm)',
        }}
      >
        Claim de <strong>{claim.claimantName}</strong> sobre <strong>{claim.listingName}</strong> — resuelto.
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 'var(--s-5)',
        border: '1px solid var(--surface-line)',
        borderRadius: 'var(--r-md)',
        background: 'var(--bg-raised)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-3)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--s-6)', flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 'var(--s-1)' }}>Listing</p>
          <p style={{ fontWeight: 600 }}>{claim.listingName}</p>
          <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>/{claim.listingSlug}</p>
        </div>
        <div>
          <p className="eyebrow" style={{ marginBottom: 'var(--s-1)' }}>Solicitante</p>
          <p style={{ fontWeight: 600 }}>{claim.claimantName}</p>
          <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>{claim.claimantEmail}</p>
        </div>
        <div>
          <p className="eyebrow" style={{ marginBottom: 'var(--s-1)' }}>Fecha</p>
          <p style={{ fontSize: 'var(--t-body-sm)' }}>
            {claim.createdAt.toLocaleDateString('es-CL')}
          </p>
        </div>
      </div>

      {claim.message && (
        <div>
          <p className="eyebrow" style={{ marginBottom: 'var(--s-1)' }}>Mensaje</p>
          <p
            style={{
              fontSize: 'var(--t-body-sm)',
              background: 'var(--bg-sunken)',
              padding: 'var(--s-3)',
              borderRadius: 'var(--r-sm)',
            }}
          >
            {claim.message}
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor={`note-${claim.claimId}`}
          style={{ fontSize: 'var(--t-body-sm)', display: 'block', marginBottom: 'var(--s-1)' }}
        >
          Nota de revisión (opcional)
        </label>
        <textarea
          id={`note-${claim.claimId}`}
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          rows={2}
          style={{
            width: '100%',
            padding: 'var(--s-2) var(--s-3)',
            fontSize: 'var(--t-body-sm)',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--surface-line)',
            background: 'var(--bg-base)',
            color: 'var(--fg-base)',
            resize: 'vertical',
          }}
        />
      </div>

      {result?.error && (
        <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--accent-error, #e53e3e)' }}>
          {result.error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--s-3)' }}>
        <button
          onClick={() => handleResolve('APPROVE')}
          disabled={loading}
          className="btn-primary"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          Aprobar
        </button>
        <button
          onClick={() => handleResolve('REJECT')}
          disabled={loading}
          className="btn-secondary"
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          Rechazar
        </button>
      </div>
    </div>
  )
}
