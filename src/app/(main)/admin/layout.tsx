import type { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Admin — Portal Panorama' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/admin')
  if ((session.user as { role?: string }).role !== 'ADMIN') redirect('/mi-cuenta')

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100dvh - 72px)' }}>
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
          <p className="eyebrow">Admin</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <SidebarLink href="/admin/lugares">Lugares</SidebarLink>
          <SidebarLink href="/admin/lugares/nuevo">Nuevo lugar</SidebarLink>
        </nav>
      </aside>

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
