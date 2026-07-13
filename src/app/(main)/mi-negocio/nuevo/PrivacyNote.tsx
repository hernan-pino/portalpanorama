'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// Justo antes de enviar, mandar al dueño a /privacidad lo saca del flujo (pierde lo
// que llenó). El resumen abre en un popup y la página completa sigue a un clic, en
// pestaña aparte.
export function PrivacyNote() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
        Publicar tu negocio es gratis. Usaremos estos datos para armar tu ficha y verificar tu
        vínculo con el negocio (
        <button type="button" className="wizard-panel__switch" onClick={() => setOpen(true)}>
          cómo usamos tus datos
        </button>
        ).
      </p>

      {open && (
        <div
          className="save-modal__scrim"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="save-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            style={{ maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="save-modal__title" id="privacy-title">Cómo usamos tus datos</p>

            <ul className="wizard-next" style={{ margin: 0 }}>
              <li>
                <strong>Los datos del local</strong> (nombre, dirección, comuna, rubro) son la base
                de tu ficha: se publican en Portal Panorama, como los de cualquier lugar de la guía.
              </li>
              <li>
                <strong>Tu teléfono e Instagram</strong> los usamos para verificar que el negocio es
                tuyo. Si son los de contacto público del local, van también en la ficha.
              </li>
              <li>
                <strong>El correo de tu cuenta no se publica.</strong> Lo usamos para avisarte cómo
                va tu solicitud.
              </li>
              <li>
                <strong>Puedes echarte atrás.</strong> Escríbenos a{' '}
                <a href="mailto:hola@portalpanorama.cl">hola@portalpanorama.cl</a> y sacamos tu
                ficha o tus datos.
              </li>
            </ul>

            <div className="save-modal__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setOpen(false)}>
                Entendido
              </button>
              <Link href="/privacidad" target="_blank" className="btn btn--ghost btn--sm">
                Política completa ↗
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
