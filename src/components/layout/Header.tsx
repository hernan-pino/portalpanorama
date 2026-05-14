import Link from 'next/link'
import { auth } from '@lib/auth'
import { UserRole } from '@domain/user/UserRole'
import { signOutAction } from '@/app/actions/auth'
import { MobileNav } from './MobileNav'

export async function Header() {
  const session = await auth()
  const user = session?.user
  const role = (user as { role?: string } | undefined)?.role

  return (
    <header className="topbar">
      <div className="container">
        <div className="topbar__inner">
          {/* Brand */}
          <Link href="/" className="brand">
            <span className="brand__mark" aria-hidden="true" />
            Portal<em>Panorama</em>
          </Link>

          {/* Nav */}
          <nav className="topbar__nav" aria-label="Navegación principal">
            <Link href="/explorar">Explorar</Link>
            <Link href="/eventos">Eventos</Link>
            <Link href="/planes">Planes</Link>
          </nav>

          {/* Actions */}
          <div className="topbar__actions">
            {user ? (
              <AuthenticatedActions name={user.name ?? ''} role={role} />
            ) : (
              <GuestActions />
            )}
            <MobileNav
              isAuthenticated={!!user}
              role={role}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

function GuestActions() {
  return (
    <>
      <Link href="/login" className="btn btn--ghost btn--sm">
        Iniciar sesión
      </Link>
      <Link href="/listar-mi-local" className="btn btn--primary btn--sm">
        Listar mi local
      </Link>
    </>
  )
}

function AuthenticatedActions({
  name,
  role,
}: {
  name: string
  role?: string
}) {
  const firstName = name.split(' ')[0]

  if (role === UserRole.ADMIN) {
    return (
      <>
        <Link href="/admin" className="btn btn--ghost btn--sm">
          Admin
        </Link>
        <Link href="/dashboard" className="btn btn--ghost btn--sm">
          Dashboard
        </Link>
        <LogoutButton />
      </>
    )
  }

  if (role === UserRole.BUSINESS_OWNER) {
    return (
      <>
        <Link href="/mi-negocio" className="btn btn--ghost btn--sm">
          {firstName}
        </Link>
        <Link href="/mi-negocio" className="btn btn--primary btn--sm">
          Mi negocio
        </Link>
        <LogoutButton />
      </>
    )
  }

  // CONSUMER
  return (
    <>
      <Link href="/mi-cuenta" className="btn btn--ghost btn--sm">
        {firstName}
      </Link>
      <Link href="/listar-mi-local" className="btn btn--primary btn--sm">
        Listar mi negocio
      </Link>
      <LogoutButton />
    </>
  )
}

function LogoutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="btn btn--ghost btn--sm">
        Salir
      </button>
    </form>
  )
}
