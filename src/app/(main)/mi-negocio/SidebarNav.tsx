'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'

const TABS = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'fichas', label: 'Mis fichas' },
  { key: 'estadisticas', label: 'Estadísticas' },
  { key: 'resenas', label: 'Reseñas' },
  { key: 'plan', label: 'Plan' },
  { key: 'guardados', label: 'Guardados' },
  { key: 'listas', label: 'Mis listas' },
  { key: 'perfil', label: 'Mi perfil' },
]

export function SidebarNav() {
  const searchParams = useSearchParams()
  const current = searchParams.get('tab') ?? 'resumen'

  return (
    <nav className="dash-sidenav">
      {TABS.map(({ key, label }) => (
        <Link
          key={key}
          href={`/mi-negocio?tab=${key}`}
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
