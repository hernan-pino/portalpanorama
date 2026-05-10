import type { Metadata } from 'next'
import { Suspense } from 'react'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { UserRole } from '@domain/user/UserRole'
import { SidebarNav } from './SidebarNav'

export const metadata: Metadata = { title: 'Mi negocio' }

export default async function MiNegocioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/mi-negocio')
  if (session.user.role !== UserRole.BUSINESS_OWNER && session.user.role !== UserRole.ADMIN) {
    redirect('/listar-mi-local/step1')
  }

  const firstName = session.user.name?.split(' ')[0] ?? 'Bienvenido'

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100dvh - 72px)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '220px',
          flexShrink: 0,
          borderRight: '1px solid var(--surface-line)',
          background: 'var(--bg-raised)',
          padding: 'var(--s-6) 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '0 var(--s-5)', marginBottom: 'var(--s-6)' }}>
          <p className="eyebrow" style={{ marginBottom: 'var(--s-1)' }}>Mi negocio</p>
          <p style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500, color: 'var(--fg-default)' }}>
            {firstName}
          </p>
        </div>
        <Suspense fallback={null}>
          <SidebarNav />
        </Suspense>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
