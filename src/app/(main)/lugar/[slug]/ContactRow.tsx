'use client'
import type { ReactNode } from 'react'
import { trackEvent } from '@lib/analytics'
import { PlaceClickKind } from '@domain/place/PlaceClickKind'
import { recordPlaceClickAction } from './actions'

interface Props {
  icon: ReactNode
  k: string
  v: string
  href: string
  placeId: string
  kind: PlaceClickKind
}

// Fila de contacto de la ficha (teléfono / web / Instagram / carta / otra red).
// Cliente porque registra la INTENCIÓN DE CONTACTO: es la métrica que el dueño ve
// en su panel. Fire-and-forget — el enlace navega igual aunque el registro falle.
export function ContactRow({ icon, k, v, href, placeId, kind }: Props) {
  const external = href.startsWith('http')
  return (
    <a
      className="ficha__crow"
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={() => {
        trackEvent('click_contacto', { place_id: placeId, kind })
        void recordPlaceClickAction(placeId, kind)
      }}
    >
      <span className="ci">{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span className="ck">{k}</span>
        <span className="cv">{v}</span>
      </span>
    </a>
  )
}
