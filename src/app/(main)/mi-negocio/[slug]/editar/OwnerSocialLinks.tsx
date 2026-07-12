'use client'
import { useState } from 'react'
import { OWNER_SOCIAL_NETWORKS } from './socialNetworks'

export interface SocialLinkRow {
  network: string
  url: string
}

// Repetidor de redes extra (WhatsApp/Facebook/TikTok/YouTube…). Vive dentro del
// form de edición: serializa su estado a un <input hidden name="socialLinks"> que
// viaja en el FormData. Instagram va aparte (campo propio del form).
export function OwnerSocialLinks({ initial }: { initial: SocialLinkRow[] }) {
  const [links, setLinks] = useState<SocialLinkRow[]>(initial)

  function add() {
    setLinks((v) => [...v, { network: OWNER_SOCIAL_NETWORKS[0], url: '' }])
  }
  function update(i: number, field: 'network' | 'url', value: string) {
    setLinks((v) => v.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)))
  }
  function remove(i: number) {
    setLinks((v) => v.filter((_, idx) => idx !== i))
  }

  // Solo las filas con URL viajan (una fila recién agregada sin URL no ensucia).
  const serialized = JSON.stringify(links.filter((l) => l.url.trim() !== ''))

  return (
    <div className="osocial">
      <input type="hidden" name="socialLinks" value={serialized} />

      {links.length > 0 && (
        <ul className="osocial__list">
          {links.map((l, i) => (
            <li key={i} className="osocial__row">
              <select
                className="form-input osocial__net"
                value={l.network}
                onChange={(e) => update(i, 'network', e.target.value)}
                aria-label="Red social"
              >
                {OWNER_SOCIAL_NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <input
                className="form-input osocial__url"
                type="url"
                value={l.url}
                onChange={(e) => update(i, 'url', e.target.value)}
                placeholder="https://…"
                aria-label="Enlace de la red"
              />
              <button type="button" className="osocial__remove" onClick={() => remove(i)}
                aria-label="Quitar red">✕</button>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="btn btn--ghost btn--sm" onClick={add}>
        + Agregar red
      </button>
    </div>
  )
}
