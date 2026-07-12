'use client'
import { NavIcon } from './icons'
import { trackEvent } from '@lib/analytics'
import { PlaceClickKind } from '@domain/place/PlaceClickKind'
import { recordPlaceClickAction } from './actions'

interface Props {
  href: string
  placeId: string
  placeName: string
  /** En la barra fija el botón ocupa todo el ancho y centra el contenido. */
  block?: boolean
}

// "Cómo llegar" como componente cliente para registrar el clic: en GA4 (analítica
// del sitio) y en NUESTRA BD (métrica que el dueño ve en su panel). El destino es
// el mismo link a Google Maps que arma la ficha; el registro es fire-and-forget.
export function DirectionsLink({ href, placeId, placeName, block }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn--ghost"
      style={block ? { justifyContent: 'center' } : undefined}
      onClick={() => {
        trackEvent('click_como_llegar', { place_id: placeId, place_name: placeName })
        void recordPlaceClickAction(placeId, PlaceClickKind.DIRECTIONS)
      }}
    >
      <NavIcon /> Cómo llegar
    </a>
  )
}
