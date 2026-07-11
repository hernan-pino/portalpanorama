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
          Cuéntanos algo sobre ti y el local <span style={{ color: 'var(--fg-subtle)' }}>(opcional)</span>
        </label>
        <textarea
          id="claim-message"
          name="message"
          className="form-input"
          rows={3}
          maxLength={1000}
          placeholder="Ej: soy la dueña desde 2019, cualquier duda me avisan…"
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
          Teléfono de contacto <span style={{ color: 'var(--fg-subtle)' }}>(opcional)</span>
        </label>
        <input id="claim-phone" name="contactPhone" type="tel" className="form-input" maxLength={30} placeholder="+56 9 …" />
      </div>

      {/* Cómo se verifica (decisión s28: DM del IG oficial o correo del local) */}
      <div className="claim-verify">
        <p className="claim-verify__title">Un paso más para verificarte</p>
        <p className="claim-verify__body">
          Para confirmar que el local es tuyo, escríbenos <strong>desde el canal oficial de
          {' '}{placeName}</strong>: un mensaje directo desde su Instagram oficial a{' '}
          <a href="https://instagram.com/portalpanorama.cl" target="_blank" rel="noopener noreferrer">@portalpanorama.cl</a>,
          o un correo desde el correo oficial del local a{' '}
          <a href="mailto:hola@portalpanorama.cl">hola@portalpanorama.cl</a>, mencionando tu nombre.
          Con eso aprobamos tu reclamo.
        </p>
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
