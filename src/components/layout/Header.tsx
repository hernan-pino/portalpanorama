import Link from 'next/link'
import { auth } from '@lib/auth'
import { UserRole } from '@domain/user/UserRole'
import { signOutAction } from '@/app/actions/auth'

export async function Header() {
  const session = await auth()
  const user = session?.user

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
              <AuthenticatedActions
                name={user.name ?? ''}
                role={(user as { role?: string }).role}
              />
            ) : (
              <GuestActions />
            )}
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
      <Link href="/registro" className="btn btn--primary btn--sm">
        Registrarse
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
  return (
    <>
      {role === UserRole.ADMIN && (
        <Link href="/admin" className="btn btn--ghost btn--sm">
          Admin
        </Link>
      )}
      {(role === UserRole.BUSINESS_OWNER || role === UserRole.ADMIN) && (
        <Link href="/dashboard" className="btn btn--ghost btn--sm">
          Dashboard
        </Link>
      )}
      <Link href="/mi-cuenta/favoritos" className="btn btn--ghost btn--sm">
        {name.split(' ')[0]}
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
