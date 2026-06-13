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

          {/* Nav — solo Explorar. "Eventos" se quitó (ruta podada en 4E, daba
              404); vuelve cuando se enciendan los eventos. */}
          <nav className="topbar__nav" aria-label="Navegación principal">
            <Link href="/explorar">Explorar</Link>
          </nav>

          {/* Actions */}
          <div className="topbar__actions">
            <div className="topbar__auth">
              {user ? (
                <AuthenticatedActions name={user.name ?? ''} role={role} />
              ) : (
                <GuestActions />
              )}
            </div>
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
    <Link href="/login" className="btn btn--primary btn--sm">
      Iniciar sesión
    </Link>
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
