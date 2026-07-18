'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useUserLocation } from './UserLocationProvider'

// Botón opt-in de /explorar. Al pedir la ubicación NO se dispara directo el permiso
// del navegador: primero abrimos un pop-up nuestro que EXPLICA para qué la usamos
// (baja el rechazo y da confianza). El diálogo nativo del navegador no se puede
// estilar —lo controla el navegador por seguridad—; lo que controlamos es este paso
// previo. Al confirmar, recién ahí se llama a getCurrentPosition y aparece el nativo.
export function NearMeButton() {
  const { status, request, clear } = useUserLocation()
  const [asking, setAsking] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

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

  function confirm() {
    setAsking(false)
    request()
  }

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

      {asking && mounted &&
        createPortal(
          <div className="save-modal__scrim" role="presentation" onClick={() => setAsking(false)}>
            <div
              className="save-modal geo-ask"
              role="dialog"
              aria-modal="true"
              aria-label="Usar tu ubicación"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="save-modal__close"
                aria-label="Cerrar"
                onClick={() => setAsking(false)}
              >
                ×
              </button>

              <span className="geo-ask__icon"><PinIcon size={22} /></span>
              <h4 className="save-modal__title">Lugares cerca de ti</h4>
              <p className="save-modal__lead">
                Usamos tu ubicación <strong>solo</strong> para mostrarte a qué distancia queda
                cada lugar. No la guardamos ni la compartimos, y puedes desactivarla cuando quieras.
              </p>
              <div className="save-modal__actions">
                <button
                  type="button"
                  className="btn btn--accent"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={confirm}
                >
                  Activar ubicación
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setAsking(false)}
                >
                  Ahora no
                </button>
              </div>
              <p className="geo-ask__hint">El navegador te pedirá permiso después de activar.</p>
            </div>
          </div>,
          document.body,
        )}
    </span>
  )
}

function PinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}
