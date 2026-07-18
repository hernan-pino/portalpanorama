'use client'

import { useState } from 'react'
import { useUserLocation } from './UserLocationProvider'
import { GeoAskDialog } from './GeoAskDialog'
import { PinIcon } from './PinIcon'

// Botón opt-in de /explorar. Sigue disponible siempre, aunque el prompt automático
// (NearMePrompt) ya haya ofrecido activar la ubicación: es la vía manual para quien
// lo cerró o quiere apagarla.
export function NearMeButton() {
  const { status, request, clear } = useUserLocation()
  const [asking, setAsking] = useState(false)

  if (status === 'granted') {
    return (
      <button type="button" className="nearme nearme--on" onClick={clear} aria-pressed="true">
        <PinIcon />
        Cerca de ti
        <span className="nearme__x" aria-hidden="true">×</span>
      </button>
    )
  }

  // Mensaje corto por causa (se apila bajo el botón, no ensancha la barra).
  const note =
    status === 'denied' ? 'Permiso bloqueado — actívalo en el candado de la barra'
    : status === 'unavailable' ? 'Activa la ubicación de tu sistema e intenta de nuevo'
    : status === 'timeout' ? 'La ubicación tardó demasiado — intenta de nuevo'
    : null

  return (
    <span className="nearme-wrap">
      <button
        type="button"
        className="nearme"
        onClick={() => setAsking(true)}
        disabled={status === 'loading'}
        aria-pressed="false"
      >
        <PinIcon />
        {status === 'loading' ? 'Ubicándote…' : 'Cerca de mí'}
      </button>
      {note && <span className="nearme__note">{note}</span>}

      {asking && (
        <GeoAskDialog
          onAccept={() => {
            setAsking(false)
            request()
          }}
          onDismiss={() => setAsking(false)}
        />
      )}
    </span>
  )
}
