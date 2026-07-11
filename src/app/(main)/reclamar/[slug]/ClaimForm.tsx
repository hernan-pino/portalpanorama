'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClaimAction } from './actions'
import { trackEvent } from '@lib/analytics'

const ROLES = ['Dueño/a', 'Representante legal', 'Encargado/a o administrador/a']

export function ClaimForm({
  slug,
  placeName,
  defaultEmail,
}: {
  slug: string
  placeName: string
  defaultEmail: string
}) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await createClaimAction(formData)
      if ('error' in res) { setError(res.error); return }
      trackEvent('reclamar_ficha', { place_slug: slug })
      setDone(true)
    })
  }

  if (done) {
    return (
      <section className="legal__section">
        <h2>¡Listo! Recibimos tu reclamo</h2>
        <p>
          Te enviamos un correo de confirmación. Vamos a revisar tu solicitud a mano — puede
          que te contactemos para confirmar que eres parte del equipo de {placeName} — y te
          avisaremos por correo apenas tengamos una respuesta.
        </p>
        <p>
          <Link href={`/lugar/${slug}`} className="btn btn--ghost btn--sm">Volver a la ficha</Link>
        </p>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', maxWidth: 520 }}
    >
      <input type="hidden" name="slug" value={slug} />

      <div>
        <label className="form-label" htmlFor="claim-role">¿Cuál es tu rol en el negocio?</label>
        <select id="claim-role" name="role" className="form-input" defaultValue={ROLES[0]}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="claim-message">
          Cuéntanos algo que nos ayude a verificarte <span style={{ color: 'var(--fg-subtle)' }}>(opcional)</span>
        </label>
        <textarea
          id="claim-message"
          name="message"
          className="form-input"
          rows={4}
          maxLength={1000}
          placeholder="Ej: soy la dueña, el teléfono de la ficha es el del local y pueden llamar en horario de atención…"
        />
      </div>

      <div>
        <label className="form-label" htmlFor="claim-email">Correo de contacto</label>
        <input
          id="claim-email"
          name="contactEmail"
          type="email"
          className="form-input"
          defaultValue={defaultEmail}
        />
      </div>

      <div>
        <label className="form-label" htmlFor="claim-phone">
          Teléfono de contacto <span style={{ color: 'var(--fg-subtle)' }}>(opcional, acelera la verificación)</span>
        </label>
        <input id="claim-phone" name="contactPhone" type="tel" className="form-input" maxLength={30} placeholder="+56 9 …" />
      </div>

      <div>
        <label className="form-label" htmlFor="claim-evidence">
          Enlace que respalde tu vínculo <span style={{ color: 'var(--fg-subtle)' }}>(opcional)</span>
        </label>
        <input
          id="claim-evidence"
          name="evidenceUrl"
          type="url"
          className="form-input"
          placeholder="https:// — ej. el Instagram del local donde aparezcas, o tu perfil en el sitio"
        />
      </div>

      {error && <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Enviando…' : 'Enviar reclamo'}
        </button>
        <Link href={`/lugar/${slug}`} className="btn btn--ghost">Cancelar</Link>
      </div>

      <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
        Reclamar una ficha es gratis. Usaremos estos datos solo para verificar tu vínculo con
        el negocio (<Link href="/privacidad">privacidad</Link>).
      </p>
    </form>
  )
}
