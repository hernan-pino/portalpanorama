'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { trackEvent } from '@lib/analytics'

// Modal de bienvenida tras registrarse. Se dispara con ?bienvenida=1 (lo agrega
// el registro al auto-login). Descartable y NO bloqueante: solo explica la idea,
// no es una encuesta (decisión de producto C.2). Al cerrar limpia el query para
// que un refresh no lo reabra.
export function WelcomeModal() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(params.get('bienvenida') === '1')

  // El modal solo se muestra justo tras registrarse (?bienvenida=1) → es la señal
  // fiable de "cuenta nueva creada". sign_up es el evento recomendado de GA4.
  useEffect(() => {
    if (params.get('bienvenida') === '1') trackEvent('sign_up', { method: 'email' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    const next = new URLSearchParams(params.toString())
    next.delete('bienvenida')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [params, pathname, router])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null

  return (
    <div className="welcome-modal__scrim" onClick={close}>
      <div
        className="welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="welcome-modal__eyebrow">Tu cuenta está lista</p>
        <h2 id="welcome-title" className="welcome-modal__title">
          Te damos la bienvenida a Portal&nbsp;Panorama
        </h2>
        <p className="welcome-modal__lead">
          Acá encontrás qué hacer en tu ciudad —lugares, panoramas y experiencias— filtrando
          por lo que necesitás: con quién vas, presupuesto, comuna o cerca del metro.
        </p>
        <ul className="welcome-modal__list">
          <li>Filtrá por contexto: en pareja, con amigos, con niños, pet friendly.</li>
          <li>Compará precio, horario y cómo llegar sin saltar entre apps.</li>
          <li>Guardá tus favoritos en listas para tenerlos a mano.</li>
        </ul>
        <div className="welcome-modal__actions">
          <Link href="/explorar" className="btn btn--primary" onClick={close}>
            Explorar lugares
          </Link>
          <button type="button" className="btn btn--ghost" onClick={close}>
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
