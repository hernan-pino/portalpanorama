'use client'
import { useState, useTransition } from 'react'
import { createSuggestionAction } from '@/app/actions/suggestions'

const KINDS = [
  { value: 'FALTA_LUGAR', label: 'Falta un lugar / agreguen uno' },
  { value: 'FOTO', label: 'Una foto está mal o se puede mejorar' },
  { value: 'INFO', label: 'Me gustaría ver cierta info' },
  { value: 'OTRO', label: 'Otra cosa' },
]

// Tarjeta de participación del footer + popup con el mini formulario de sugerencias.
// Anónimo-friendly: no exige login. La action tiene rate-limit por IP.
export function SuggestionWidget() {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function close() {
    setOpen(false)
    setDone(false)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await createSuggestionAction({
        kind: fd.get('kind'),
        message: fd.get('message'),
        email: fd.get('email') || undefined,
      })
      if ('error' in result) setError(result.error)
      else setDone(true)
    })
  }

  return (
    <div className="footer-cta-card">
      <p className="footer-cta-card__title">Ayúdanos a mejorar</p>
      <p className="footer-cta-card__sub">
        ¿Falta un lugar o viste un dato malo? Cuéntanos, suma a la guía.
      </p>
      <button className="btn btn--primary btn--sm" onClick={() => setOpen(true)}>
        Enviar sugerencia
      </button>

      {open && (
        <div className="confirm-modal__scrim" role="presentation" onClick={close}>
          <div
            className="confirm-modal suggest-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="suggest-title"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <>
                <h2 id="suggest-title" className="confirm-modal__title">¡Gracias! 🙌</h2>
                <p className="confirm-modal__lead">
                  Recibimos tu sugerencia y la revisamos pronto.
                </p>
                <div className="confirm-modal__actions">
                  <button className="btn btn--primary btn--sm" onClick={close}>Listo</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 id="suggest-title" className="confirm-modal__title">Enviar una sugerencia</h2>
                <div className="suggest-field">
                  <label className="form-label" htmlFor="suggest-kind">¿De qué se trata?</label>
                  <select id="suggest-kind" name="kind" className="form-input" defaultValue="FALTA_LUGAR">
                    {KINDS.map((k) => (
                      <option key={k.value} value={k.value}>{k.label}</option>
                    ))}
                  </select>
                </div>
                <div className="suggest-field">
                  <label className="form-label" htmlFor="suggest-msg">Tu sugerencia</label>
                  <textarea
                    id="suggest-msg"
                    name="message"
                    className="form-input"
                    rows={4}
                    maxLength={1000}
                    required
                    placeholder="Cuéntanos qué agregarías, corregirías o te gustaría ver…"
                  />
                </div>
                <div className="suggest-field">
                  <label className="form-label" htmlFor="suggest-email">
                    Tu email <span className="suggest-hint">(opcional, si quieres respuesta)</span>
                  </label>
                  <input
                    id="suggest-email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="tu@email.cl"
                  />
                </div>
                {error && <p className="admin-row-actions__error" role="alert">{error}</p>}
                <div className="confirm-modal__actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={close}>Cancelar</button>
                  <button type="submit" className="btn btn--primary btn--sm" disabled={isPending}>
                    {isPending ? 'Enviando…' : 'Enviar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
