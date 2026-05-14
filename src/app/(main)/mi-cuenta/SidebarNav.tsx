'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'

const TABS = [
  { key: 'guardados', label: 'Guardados' },
  { key: 'listas', label: 'Mis listas' },
  { key: 'historial', label: 'Historial' },
  { key: 'resenas', label: 'Mis reseñas' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'perfil', label: 'Perfil' },
  { key: 'config', label: 'Configuración' },
]

export function SidebarNav() {
  const searchParams = useSearchParams()
  const current = searchParams.get('tab') ?? 'guardados'

  return (
    <nav className="dash-sidenav">
      {TABS.map(({ key, label }) => (
        <Link
          key={key}
          href={`/mi-cuenta?tab=${key}`}
          className={`dash-sidenav__link${current === key ? ' active' : ''}`}
        >
          {label}
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
