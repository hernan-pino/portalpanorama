'use client'
import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { UserRole } from '@domain/user/UserRole'

interface MobileNavProps {
  isAuthenticated: boolean
  role?: string
}

export function MobileNav({ isAuthenticated, role }: MobileNavProps) {
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

      {open && (
        <>
          <div className="mobile-nav-backdrop" onClick={close} aria-hidden="true" />
          <div className="mobile-nav-panel">
            <nav className="mobile-nav-links" aria-label="Menú principal">
              <Link href="/explorar" onClick={close}>Explorar</Link>
            </nav>

            <div className="mobile-nav-divider" />

            <div className="mobile-nav-auth">
              {isAuthenticated ? (
                <>
                  {role === UserRole.ADMIN ? (
                    <Link href="/admin" className="btn btn--ghost btn--sm" onClick={close}>
                      Admin
                    </Link>
                  ) : (
                    <Link href="/mi-cuenta" className="btn btn--ghost btn--sm" onClick={close}>
                      Mi cuenta
                    </Link>
                  )}
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={() => { close(); signOut({ callbackUrl: '/' }) }}
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link href="/login" className="btn btn--primary btn--sm" onClick={close}>
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
