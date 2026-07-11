'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClaimAction } from './actions'
import { trackEvent } from '@lib/analytics'

const ROLES = ['Dueño/a', 'Representante legal', 'Encargado/a o administrador/a']

// Reusable para reclamar un lugar (`kind='place'`) o una marca (`kind='brand'`).
export function ClaimForm({
  kind,
  slug,
  targetName,
  defaultEmail,
  backHref,
}: {
  kind: 'place' | 'brand'
  slug: string
  targetName: string
  defaultEmail: string
  backHref: string
}) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const noun = kind === 'brand' ? 'la marca' : 'el local'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const res = await createClaimAction(formData)
      if ('error' in res) { setError(res.error); return }
      trackEvent('reclamar_ficha', { kind, slug })
      setDone(true)
    })
  }

  if (done) {
    return (
      <section className="legal__section">
        <h2>¡Listo! Recibimos tu reclamo</h2>
        <p>
          Te enviamos un correo con el último paso para verificarte. Apenas confirmemos que
          eres parte del equipo de {targetName}, te avisamos por correo y {noun} queda asociado
          a tu cuenta.
        </p>
        <p>
          <Link href={backHref} className="btn btn--ghost btn--sm">Volver</Link>
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
      <input type="hidden" name="kind" value={kind} />

      <div>
        <label className="form-label" htmlFor="claim-role">¿Cuál es tu rol en el negocio?</label>
        <select id="claim-role" name="role" className="form-input" defaultValue={ROLES[0]}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="claim-message">
          Cuéntanos algo sobre ti y {noun} <span style={{ color: 'var(--fg-subtle)' }}>(opcional)</span>
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

      {/* Cómo se verifica (decisión s28: DM del IG oficial o correo del negocio) */}
      <div className="claim-verify">
        <p className="claim-verify__title">Un paso más para verificarte</p>
        <p className="claim-verify__body">
          Para confirmar que {noun} es tuyo, escríbenos <strong>desde su canal oficial</strong>:
          un mensaje directo desde el Instagram oficial de {targetName} a{' '}
          <a href="https://instagram.com/portalpanorama.cl" target="_blank" rel="noopener noreferrer">@portalpanorama.cl</a>,
          o un correo desde el correo oficial a{' '}
          <a href="mailto:hola@portalpanorama.cl">hola@portalpanorama.cl</a>, mencionando tu nombre.
          Con eso aprobamos tu reclamo.
        </p>
      </div>

      {error && <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', margin: 0 }}>{error}</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Enviando…' : 'Enviar reclamo'}
        </button>
        <Link href={backHref} className="btn btn--ghost">Cancelar</Link>
      </div>

      <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
        Reclamar es gratis. Usaremos estos datos solo para verificar tu vínculo con el negocio
        (<Link href="/privacidad">privacidad</Link>).
      </p>
    </form>
  )
}
