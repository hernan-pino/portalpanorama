'use client'

import { useState } from 'react'
import { resolveTagAction } from './actions'

interface TagRowProps {
  tagId: string
  tagName: string
  tagSlug: string
  listingId: string
  listingName: string
  listingSlug: string
}

export function TagRow({ tag }: { tag: TagRowProps }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  async function handleResolve(decision: 'APPROVE' | 'REJECT') {
    setLoading(true)
    setResult(null)
    const res = await resolveTagAction(tag.tagId, tag.listingId, decision)
    setResult(res)
    setLoading(false)
  }

  if (result?.success) {
    return (
      <div
        style={{
          padding: 'var(--s-4) var(--s-5)',
          border: '1px solid var(--surface-line)',
          borderRadius: 'var(--r-md)',
          background: 'var(--bg-raised)',
          color: 'var(--fg-muted)',
          fontSize: 'var(--t-body-sm)',
        }}
      >
        Tag <strong>{tag.tagName}</strong> en <strong>{tag.listingName}</strong> — resuelto.
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 'var(--s-4) var(--s-5)',
        border: '1px solid var(--surface-line)',
        borderRadius: 'var(--r-md)',
        background: 'var(--bg-raised)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--s-6)',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, display: 'flex', gap: 'var(--s-6)', flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 'var(--s-1)' }}>Tag</p>
          <p style={{ fontWeight: 600 }}>{tag.tagName}</p>
          <p style={{ fontSize: 'var(--t-caption)', color: 'var(--fg-muted)' }}>#{tag.tagSlug}</p>
        </div>
        <div>
          <p className="eyebrow" style={{ marginBottom: 'var(--s-1)' }}>Listing</p>
          <p style={{ fontWeight: 600 }}>{tag.listingName}</p>
          <p style={{ fontSize: 'var(--t-caption)', color: 'var(--fg-muted)' }}>/{tag.listingSlug}</p>
        </div>
      </div>

      {result?.error && (
        <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--accent-error, #e53e3e)', width: '100%' }}>
          {result.error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--s-3)', flexShrink: 0 }}>
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
