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
    <div className="admin-shell">
      <nav className="admin-nav">
        <span className="admin-nav__brand eyebrow">Admin</span>
        <div className="admin-nav__links">
          <NavLink href="/admin/lugares">Lugares</NavLink>
          <NavLink href="/admin/lugares/nuevo">Nuevo lugar</NavLink>
          <NavLink href="/admin/marcas">Marcas</NavLink>
          <NavLink href="/admin/usuarios">Usuarios</NavLink>
          <NavLink href="/admin/reportes">Reportes</NavLink>
          <NavLink href="/admin/cobertura">Cobertura</NavLink>
        </div>
      </nav>

      <div className="admin-content">{children}</div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="admin-nav__link">
      {children}
    </Link>
  )
}
