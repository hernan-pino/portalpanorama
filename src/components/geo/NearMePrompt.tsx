'use client'

import { useEffect, useState } from 'react'
import { useUserLocation } from './UserLocationProvider'
import { GeoAskDialog } from './GeoAskDialog'

// Ofrece activar la ubicación sin que el usuario tenga que descubrir el botón, pero
// NO apenas entra: esperamos unos segundos para que primero vea los resultados y
// entienda qué gana. Pedir el permiso en el segundo 1 sube el rechazo, y un rechazo
// en iOS es casi irreversible (hay que ir a Ajustes del sistema).
const DELAY_MS = 6000

// Si lo cierra, no vuelve a salir NUNCA (localStorage, no sessionStorage: molestar en
// cada visita sería peor que no ofrecerlo). El botón "Cerca de mí" queda como vía
// manual para quien cambie de opinión.
const SEEN_KEY = 'pp:geoask:seen'

export function NearMePrompt() {
  const { status, request } = useUserLocation()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Solo para quien no tiene ubicación ni la ha rechazado en el navegador. 'idle'
    // es el único estado donde ofrecerla tiene sentido.
    if (status !== 'idle') return
    try {
      if (localStorage.getItem(SEEN_KEY)) return
    } catch {
      // localStorage no disponible: mejor no insistir.
      return
    }

    const t = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(t)
  }, [status])

  // El auto-restore del provider puede conceder la ubicación mientras corre el
  // temporizador: si ya está resuelta, el pop-up sobra.
  useEffect(() => {
    if (status !== 'idle') setOpen(false)
  }, [status])

  function remember() {
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      // sin persistencia: puede volver a salir en la próxima visita.
    }
  }

  if (!open) return null

  return (
    <GeoAskDialog
      onAccept={() => {
        remember()
        setOpen(false)
        request()
      }}
      onDismiss={() => {
        remember()
        setOpen(false)
      }}
    />
  )
}
