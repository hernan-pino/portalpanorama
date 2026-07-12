'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'

// MVP: solo los tabs con contenido real. Los stubs no-MVP (Mis listas —redundante
// con Guardados—, Eventos, Mis reseñas, Configuración) quedan fuera del nav; sus
// componentes y rutas siguen existiendo para reactivarlos sin reconstruir.
const TABS = [
  { key: 'guardados', label: 'Guardados' },
  { key: 'historial', label: 'Historial' },
  { key: 'perfil', label: 'Perfil' },
]

export function SidebarNav({ hasBusiness = false }: { hasBusiness?: boolean }) {
  const searchParams = useSearchParams()
  const current = searchParams.get('tab') ?? 'guardados'

  return (
    <nav className="dash-sidenav">
      {TABS.map(({ key, label }) => (
        <Link
          key={key}
          href={`/mi-cuenta?tab=${key}`}
          className={`dash-sidenav__link${current === key ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-2)' }}
        >
          <span>{label}</span>
        </Link>
      ))}

      {hasBusiness && (
        <Link
          href="/mi-negocio"
          className="dash-sidenav__link dash-sidenav__link--cross"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--s-2)' }}
        >
          <span>Mi negocio</span>
          <span aria-hidden="true">↗</span>
        </Link>
      )}

      <div className="dash-sidenav__footer">
        <button className="dash-sidenav__signout" onClick={() => signOut({ callbackUrl: '/' })}>
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
