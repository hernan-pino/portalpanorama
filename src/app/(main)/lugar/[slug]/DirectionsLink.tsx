'use client'
import { NavIcon } from './icons'
import { trackEvent } from '@lib/analytics'

interface Props {
  href: string
  placeId: string
  placeName: string
  /** En la barra fija el botón ocupa todo el ancho y centra el contenido. */
  block?: boolean
}

// "Cómo llegar" como componente cliente para registrar el clic en GA4 (intención
// real de visita). El destino es el mismo link a Google Maps que arma la ficha.
export function DirectionsLink({ href, placeId, placeName, block }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn--ghost"
      style={block ? { justifyContent: 'center' } : undefined}
      onClick={() => trackEvent('click_como_llegar', { place_id: placeId, place_name: placeName })}
    >
      <NavIcon /> Cómo llegar
    </a>
  )
}
