'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { FieldHelp } from '@components/ui/FieldHelp'
import { updateOwnedPlaceAction } from './actions'
import { OwnerSocialLinks, type SocialLinkRow } from './OwnerSocialLinks'
import { OwnerSchedule } from './OwnerSchedule'
import { parseSchedule } from './scheduleFormat'

const PRICE_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'FREE', label: 'Gratis' },
  { value: 'UNDER_5000', label: 'Menos de $5.000' },
  { value: 'FROM_5000_TO_15000', label: '$5.000 – $15.000' },
  { value: 'FROM_15000_TO_30000', label: '$15.000 – $30.000' },
  { value: 'OVER_30000', label: 'Más de $30.000' },
]

const RESERVATION_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'WALK_IN', label: 'Sin reserva (llegar nomás)' },
  { value: 'RECOMMENDED', label: 'Reserva recomendada' },
  { value: 'REQUIRED', label: 'Reserva obligatoria' },
]

export interface EditInitial {
  description: string
  schedule: string
  phone: string
  website: string
  instagram: string
  socialLinks: SocialLinkRow[]
  menuUrl: string
  priceRange: string
  reservation: string
  accessDetail: string
  reference: string
}

export function EditPlaceForm({ slug, initial }: { slug: string; initial: EditInitial }) {
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const res = await updateOwnedPlaceAction(formData)
      if ('error' in res) { setError(res.error); return }
      setSaved(true)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)', maxWidth: 560 }}
    >
      <input type="hidden" name="slug" value={slug} />

      <div>
        <label className="form-label" htmlFor="f-description">
          Descripción <FieldHelp tip="2–4 frases que cuenten qué hace especial al lugar: el plato estrella, el ambiente, para quién es ideal. Evita mayúsculas sostenidas y datos de contacto (esos van en sus campos)." />
        </label>
        <textarea id="f-description" name="description" className="form-input" rows={5}
          defaultValue={initial.description} maxLength={4000}
          placeholder="Cuenta qué hace especial a tu local…" />
      </div>

      <div>
        <span className="form-label">
          Horario <FieldHelp tip="Marca cada día como abierto o cerrado y pon el rango horario. Si tienes turno partido (cierras al mediodía), agrega un segundo turno. Es lo que más consulta la gente." />
        </span>
        <OwnerSchedule parsed={parseSchedule(initial.schedule)} rawFallback={initial.schedule} />
      </div>

      <div>
        <label className="form-label" htmlFor="f-phone">
          Teléfono <FieldHelp tip="Un número donde de verdad contesten (idealmente el del local). Con código: +56 9 …" />
        </label>
        <input id="f-phone" name="phone" type="tel" className="form-input"
          defaultValue={initial.phone} maxLength={40} placeholder="+56 9 …" />
      </div>

      <div>
        <label className="form-label" htmlFor="f-website">
          Sitio web <FieldHelp tip="El enlace debe empezar con https://. Si no tienes sitio, déjalo vacío — no pongas aquí tu Instagram (ese tiene su campo)." />
        </label>
        <input id="f-website" name="website" type="url" className="form-input"
          defaultValue={initial.website} placeholder="https://…" />
      </div>

      <fieldset className="edit-social">
        <legend className="edit-social__legend">
          Redes sociales <FieldHelp tip="Instagram es tu red principal (se destaca en la ficha). Suma las demás que uses — YouTube, TikTok, WhatsApp, Facebook…" />
        </legend>

        <div>
          <label className="form-label" htmlFor="f-instagram">Instagram</label>
          <input id="f-instagram" name="instagram" className="form-input"
            defaultValue={initial.instagram} maxLength={120} placeholder="@tu_local o el enlace" />
        </div>

        <div>
          <span className="form-label">Otras redes</span>
          <OwnerSocialLinks initial={initial.socialLinks} />
        </div>
      </fieldset>

      <div>
        <label className="form-label" htmlFor="f-menu">
          Carta / menú (enlace) <FieldHelp tip="Un enlace a tu carta (PDF, tu web o una foto pública). Debe empezar con https://. Que esté actualizada — una carta vieja frustra al cliente." />
        </label>
        <input id="f-menu" name="menuUrl" type="url" className="form-input"
          defaultValue={initial.menuUrl} placeholder="https://…" />
      </div>

      <div>
        <label className="form-label" htmlFor="f-price">
          Rango de precio <FieldHelp tip="El gasto típico por persona. Ayuda a que te encuentre gente con la expectativa correcta." />
        </label>
        <select id="f-price" name="priceRange" className="form-input" defaultValue={initial.priceRange}>
          {PRICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="f-reservation">
          ¿Reserva? <FieldHelp tip="¿Se puede llegar nomás o conviene reservar? Si es obligatoria, márcalo para que nadie llegue en vano." />
        </label>
        <select id="f-reservation" name="reservation" className="form-input" defaultValue={initial.reservation}>
          {RESERVATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="f-access">
          Cómo llegar / acceso <FieldHelp tip="Detalles para encontrarte una vez en la dirección: piso, local, entrada específica. Ej: 2° piso del Espacio B, entrada por el pasaje. (La dirección y el mapa los gestiona nuestro equipo.)" />
        </label>
        <input id="f-access" name="accessDetail" className="form-input"
          defaultValue={initial.accessDetail} maxLength={300} placeholder="Ej: 2° piso, entrada por el pasaje" />
      </div>

      <div>
        <label className="form-label" htmlFor="f-reference">
          Referencia <FieldHelp tip="Un punto conocido cerca que ayude a ubicarte. Ej: frente a la plaza, al lado del Jumbo." />
        </label>
        <input id="f-reference" name="reference" className="form-input"
          defaultValue={initial.reference} maxLength={300} placeholder="Ej: frente a la plaza" />
      </div>

      {error && <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', margin: 0 }}>{error}</p>}
      {saved && <p style={{ color: 'var(--ok)', fontSize: 'var(--t-body-sm)', margin: 0 }}>✓ Cambios guardados. Ya se ven en tu ficha.</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)' }}>
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <Link href="/mi-negocio" className="btn btn--ghost">Volver</Link>
      </div>
    </form>
  )
}
