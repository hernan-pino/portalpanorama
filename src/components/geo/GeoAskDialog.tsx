'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { PinIcon } from './PinIcon'

// Pop-up propio que EXPLICA para qué usamos la ubicación, antes de disparar el
// permiso del navegador (baja el rechazo y da confianza). El diálogo nativo no se
// puede estilar —lo controla el navegador por seguridad—; lo que controlamos es este
// paso previo. Lo comparten el botón "Cerca de mí" y el prompt automático.
//
// Va por createPortal a <body>: el header y las tarjetas tienen backdrop-filter, y un
// ancestro con backdrop-filter se vuelve el containing block de los position:fixed
// —el overlay quedaría atrapado dentro de la tarjeta.
export function GeoAskDialog({
  onAccept,
  onDismiss,
}: {
  onAccept: () => void
  onDismiss: () => void
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Escape cierra, como cualquier modal del sitio.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onDismiss])

  if (!mounted) return null

  return createPortal(
    <div className="save-modal__scrim" role="presentation" onClick={onDismiss}>
      <div
        className="save-modal geo-ask"
        role="dialog"
        aria-modal="true"
        aria-label="Usar tu ubicación"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="save-modal__close" aria-label="Cerrar" onClick={onDismiss}>
          ×
        </button>

        <span className="geo-ask__icon"><PinIcon size={22} /></span>
        <h4 className="save-modal__title">Lugares cerca de ti</h4>
        <p className="save-modal__lead">
          Usamos tu ubicación <strong>solo</strong> para mostrarte a qué distancia queda cada
          lugar. No la guardamos ni la compartimos, y puedes desactivarla cuando quieras.
        </p>
        <div className="save-modal__actions">
          <button
            type="button"
            className="btn btn--accent"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onAccept}
          >
            Activar ubicación
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onDismiss}
          >
            Ahora no
          </button>
        </div>
        <p className="geo-ask__hint">El navegador te pedirá permiso después de activar.</p>
      </div>
    </div>,
    document.body,
  )
}
