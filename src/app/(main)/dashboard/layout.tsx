import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/dashboard')

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100dvh - 72px)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          flexShrink: 0,
          borderRight: '1px solid var(--surface-line)',
          background: 'var(--bg-raised)',
          padding: 'var(--s-6) 0',
        }}
      >
        <div style={{ padding: '0 var(--s-5)', marginBottom: 'var(--s-4)' }}>
          <p className="eyebrow">Mi negocio</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <SidebarLink href="/dashboard">Resumen</SidebarLink>
          <SidebarLink href="/dashboard/listing/nuevo">+ Nuevo listing</SidebarLink>
          <SidebarLink href="/dashboard/suscripcion">Suscripción</SidebarLink>
        </nav>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: 'block',
        padding: 'var(--s-3) var(--s-5)',
        fontSize: 'var(--t-body-sm)',
        color: 'var(--fg-muted)',
        transition: 'color var(--d-fast), background var(--d-fast)',
      }}
    >
      {children}
    </Link>
  )
}
