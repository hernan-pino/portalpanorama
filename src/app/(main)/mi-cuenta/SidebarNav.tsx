'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'

const TABS = [
  { key: 'guardados', label: 'Guardados' },
  { key: 'resenas', label: 'Mis reseñas' },
  { key: 'listas', label: 'Mis listas', soon: true },
  { key: 'eventos', label: 'Eventos', soon: true },
  { key: 'perfil', label: 'Perfil' },
  { key: 'config', label: 'Configuración' },
]

export function SidebarNav() {
  const searchParams = useSearchParams()
  const current = searchParams.get('tab') ?? 'guardados'

  return (
    <nav className="dash-sidenav">
      {TABS.map(({ key, label, soon }) => (
        <Link
          key={key}
          href={`/mi-cuenta?tab=${key}`}
          className={`dash-sidenav__link${current === key ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-2)' }}
        >
          <span>{label}</span>
          {soon && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--fg-subtle)',
              background: 'var(--surface-line)',
              padding: '2px 5px',
              borderRadius: '3px',
              flexShrink: 0,
            }}>
              Pronto
            </span>
          )}
        </Link>
      ))}

      <div className="dash-sidenav__footer">
        <button className="dash-sidenav__signout" onClick={() => signOut({ callbackUrl: '/' })}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
