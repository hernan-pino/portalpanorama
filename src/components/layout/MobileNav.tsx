'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { UserRole } from '@domain/user/UserRole'

interface MobileNavProps {
  isAuthenticated: boolean
  role?: string
  /** Gestiona una ficha o tiene una solicitud en curso (mismo criterio del header desktop). */
  hasBusiness: boolean
}

export function MobileNav({ isAuthenticated, role, hasBusiness }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <>
      <button
        className="mobile-nav-btn icon-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
      >
        {open ? (
          <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* El menú se monta en <body>, NO dentro del header: .topbar tiene backdrop-filter,
          que convierte al header en el containing block de todo position:fixed que cuelgue
          de él. Adentro, el backdrop (inset:0 + top:72px) quedaba con altura 0 — invisible
          y, peor, sin superficie que tocar: en el celular no se podía cerrar el menú
          tocando fuera. */}
      {open && createPortal(
        <>
          <div className="mobile-nav-backdrop" onClick={close} aria-hidden="true" />
          <div className="mobile-nav-panel">
            <nav className="mobile-nav-links" aria-label="Menú principal">
              <Link href="/explorar" onClick={close}>Explorar</Link>
              <Link href="/guias" onClick={close}>Guías</Link>
              <Link href="/para-negocios" onClick={close}>Para negocios</Link>
            </nav>

            <div className="mobile-nav-divider" />

            {/* Espejo del header desktop: bajo 960px .topbar__auth se oculta, así que si
                estas puertas no están acá, en el celular no existen. */}
            <div className="mobile-nav-auth">
              {isAuthenticated ? (
                <>
                  {role === UserRole.ADMIN ? (
                    <Link href="/admin" className="btn btn--ghost btn--sm" onClick={close}>
                      Admin
                    </Link>
                  ) : hasBusiness ? (
                    <Link href="/mi-negocio" className="btn btn--ghost btn--sm" onClick={close}>
                      Mi negocio
                    </Link>
                  ) : (
                    <Link href="/mi-negocio/nuevo" className="btn btn--primary btn--sm" onClick={close}>
                      Publica tu negocio
                    </Link>
                  )}
                  <Link href="/mi-cuenta" className="btn btn--ghost btn--sm" onClick={close}>
                    Mi cuenta
                  </Link>
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => { close(); signOut({ callbackUrl: '/' }) }}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/mi-negocio/nuevo" className="btn btn--primary btn--sm" onClick={close}>
                    Publica tu negocio
                  </Link>
                  <Link href="/login" className="btn btn--ghost btn--sm" onClick={close}>
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  )
}
