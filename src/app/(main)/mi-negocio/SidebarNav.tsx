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
    <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {TABS.map(({ key, label }) => {
        const active = current === key
        return (
          <Link
            key={key}
            href={`/mi-negocio?tab=${key}`}
            style={{
              display: 'block',
              padding: 'var(--s-3) var(--s-5)',
              fontSize: 'var(--t-body-sm)',
              fontWeight: active ? 500 : 400,
              color: active ? 'var(--fg-default)' : 'var(--fg-muted)',
              background: active ? 'color-mix(in oklab, var(--ink-100) 6%, transparent)' : 'transparent',
              borderLeft: active ? '2px solid var(--ink-100)' : '2px solid transparent',
              transition: 'color var(--d-fast), background var(--d-fast)',
              textDecoration: 'none',
            }}
          >
            {label}
          </Link>
        )
      })}

      <div style={{ marginTop: 'auto', paddingTop: 'var(--s-6)', borderTop: '1px solid var(--surface-line)', margin: 'auto var(--s-5) 0' }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{
            width: '100%',
            padding: 'var(--s-3) 0',
            fontSize: 'var(--t-body-sm)',
            color: 'var(--fg-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </nav>
  )
}
