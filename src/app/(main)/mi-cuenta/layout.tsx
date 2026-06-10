import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { getUserDashboard } from '@lib/userDashboardCache'
import { SidebarNav } from './SidebarNav'

export const metadata: Metadata = { title: 'Mi cuenta' }

const MESES_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export default async function MiCuentaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/mi-cuenta')

  const data = await getUserDashboard(session.user.id)
  const { user, collections, history } = data

  const firstName = user.name.split(' ')[0]
  const mes = MESES_ES[user.createdAt.getMonth()].toUpperCase()
  const año = user.createdAt.getFullYear()

  return (
    <div>
      {/* User header */}
      <div className="dash-user-header">
        <p className="eyebrow" style={{ marginBottom: 'var(--s-4)', fontSize: 'var(--t-mono-sm)' }}>
          MI CUENTA · MIEMBRO DESDE {mes} {año}
        </p>

        <div className="dash-header-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-5)' }}>
            {/* Avatar */}
            <div
              style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'var(--accent-30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--t-h3)', fontWeight: 600, color: 'var(--ink-100)' }}>
                {firstName[0].toUpperCase()}
              </span>
            </div>

            <div>
              <h1 className="display" style={{ fontSize: 'var(--t-h1)', lineHeight: 1.1, marginBottom: 'var(--s-2)' }}>
                Hola, <em>{firstName}.</em>
              </h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', color: 'var(--fg-muted)', letterSpacing: 'var(--tr-wide)', textTransform: 'uppercase' }}>
                {collections.length} listas · {history.length} visitados
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'center', flexShrink: 0 }}>
            <Link href="/mi-cuenta?tab=perfil" className="btn btn--primary btn--sm">Editar perfil</Link>
          </div>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="dash-shell" style={{ minHeight: 'calc(100dvh - 200px)' }}>
        <aside className="dash-sidebar">
          <Suspense fallback={null}>
            <SidebarNav />
          </Suspense>
        </aside>
        <div className="dash-content">{children}</div>
      </div>
    </div>
  )
}
