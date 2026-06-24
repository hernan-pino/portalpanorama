import type { Metadata } from 'next'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { UsersAdminList, type AdminUserRowView } from './UsersAdminList'

export const metadata: Metadata = { title: 'Usuarios — Admin' }

export default async function UsuariosPage() {
  const [session, users] = await Promise.all([
    auth(),
    container.getListUsersForAdminUseCase().execute(),
  ])
  const currentUserId = session?.user?.id ?? ''

  // Subconjunto serializable para el cliente (Date → ISO string).
  const rows: AdminUserRowView[] = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    authMethod: u.authMethod,
    savedCount: u.savedCount,
    createdAt: u.createdAt.toISOString(),
  }))

  const adminCount = rows.filter((u) => u.role === 'ADMIN').length

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="admin-page__title">Usuarios</h1>
          <p className="admin-page__sub">
            {rows.length} {rows.length === 1 ? 'registrado' : 'registrados'} · {adminCount} admin
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="admin-empty">Todavía no hay usuarios registrados.</p>
      ) : (
        <UsersAdminList users={rows} currentUserId={currentUserId} />
      )}
    </div>
  )
}
