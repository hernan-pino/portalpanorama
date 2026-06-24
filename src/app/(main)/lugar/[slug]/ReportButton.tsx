'use client'
import { useState, useTransition } from 'react'
import { FlagIcon } from './icons'
import { reportPlaceAction } from './actions'
import { trackEvent } from '@lib/analytics'

const REASONS = [
  { value: 'CLOSED', label: 'El lugar cerró' },
  { value: 'WRONG_INFO', label: 'Hay información incorrecta' },
  { value: 'DUPLICATE', label: 'Está duplicado' },
  { value: 'OTHER', label: 'Otro' },
]

export function ReportButton({ placeId }: { placeId: string }) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await reportPlaceAction(formData)
      if ('error' in res) { setError(res.error); return }
      trackEvent('reportar_lugar', { place_id: placeId, reason: String(formData.get('reason') ?? '') })
      setDone(true)
    })
  }

  if (done) {
    return (
      <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
        ¡Gracias! Recibimos tu reporte y lo vamos a revisar.
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s-2)', color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', fontWeight: 500 }}
      >
        <FlagIcon className="ico ico-sm" />
        Reportar dato incorrecto o lugar cerrado
      </button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 420, margin: '0 auto', textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: 'var(--s-3)',
        padding: 'var(--s-5)', background: 'var(--bg-raised)',
        border: '1px solid var(--surface-line)', borderRadius: 'var(--r-lg)',
      }}
    >
      <input type="hidden" name="placeId" value={placeId} />

      <label className="form-label" htmlFor="report-reason">¿Qué pasa con este lugar?</label>
      <select id="report-reason" name="reason" className="form-input" defaultValue="CLOSED">
        {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>

      <textarea
        name="message"
        className="form-input"
        rows={3}
        maxLength={500}
        placeholder="Contanos un poco más (opcional)…"
      />

      {error && <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
        <button type="submit" className="btn btn--primary btn--sm" disabled={isPending}>
          {isPending ? 'Enviando…' : 'Enviar reporte'}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
