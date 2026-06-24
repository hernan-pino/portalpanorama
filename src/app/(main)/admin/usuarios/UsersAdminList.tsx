'use client'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setUserRoleAction } from './actions'

// Read-model serializable que recibe la tabla (Date ya es ISO string).
export interface AdminUserRowView {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  authMethod: 'password' | 'oauth' | 'both' | 'none'
  savedCount: number
  createdAt: string
}

type RoleFilter = 'TODOS' | 'ADMIN' | 'USER'

const ROLE_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ADMIN', label: 'Admins' },
  { value: 'USER', label: 'Usuarios' },
]

const AUTH_LABELS: Record<AdminUserRowView['authMethod'], string> = {
  password: 'Contraseña',
  oauth: 'Google',
  both: 'Google + contraseña',
  none: '—',
}

const dateFmt = new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })

type PendingChange = { id: string; name: string; nextRole: 'USER' | 'ADMIN' }

export function UsersAdminList({
  users,
  currentUserId,
}: {
  users: AdminUserRowView[]
  currentUserId: string
}) {
  const router = useRouter()
  const [filter, setFilter] = useState<RoleFilter>('TODOS')
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingChange | null>(null)

  const counts = useMemo(() => {
    const c = { TODOS: users.length, ADMIN: 0, USER: 0 }
    for (const u of users) c[u.role]++
    return c
  }, [users])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      const matchesRole = filter === 'TODOS' || u.role === filter
      const matchesQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      return matchesRole && matchesQuery
    })
  }, [users, filter, query])

  function confirmChange() {
    if (!pending) return
    const change = pending
    setPending(null)
    setError(null)
    startTransition(async () => {
      const result = await setUserRoleAction({ targetUserId: change.id, role: change.nextRole })
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <>
      <div className="admin-filters">
        <div className="admin-filters__tabs" role="tablist" aria-label="Filtrar por rol">
          {ROLE_TABS.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={filter === t.value}
              className={`admin-filters__tab${filter === t.value ? ' is-active' : ''}`}
              onClick={() => setFilter(t.value)}
            >
              {t.label} <span className="admin-filters__count">{counts[t.value]}</span>
            </button>
          ))}
        </div>
        <div className="admin-filters__controls">
          <input
            type="search"
            className="admin-filters__search"
            placeholder="Buscar por nombre o email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar por nombre o email"
          />
        </div>
      </div>

      {error && <p className="admin-row-actions__error" role="alert">{error}</p>}

      <p className="admin-page__sub">
        {filtered.length} {filtered.length === 1 ? 'usuario' : 'usuarios'}
      </p>

      {filtered.length === 0 ? (
        <p className="admin-empty">No hay usuarios que coincidan con el filtro.</p>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Ingreso</th>
                <th>Registrado</th>
                <th>Guardados</th>
                <th>Rol</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const isSelf = u.id === currentUserId
                return (
                  <tr key={u.id}>
                    <td>
                      {u.name}
                      {isSelf && <span className="admin-self-tag"> (tú)</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>{AUTH_LABELS[u.authMethod]}</td>
                    <td>{dateFmt.format(new Date(u.createdAt))}</td>
                    <td>{u.savedCount}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${u.role === 'ADMIN' ? 'published' : 'archived'}`}>
                        {u.role === 'ADMIN' ? 'Admin' : 'Usuario'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        {u.role === 'USER' ? (
                          <button
                            className="btn btn--ghost btn--sm"
                            disabled={isPending}
                            onClick={() => setPending({ id: u.id, name: u.name, nextRole: 'ADMIN' })}
                          >
                            Hacer admin
                          </button>
                        ) : isSelf ? (
                          <span className="admin-self-tag">—</span>
                        ) : (
                          <button
                            className="btn btn--ghost btn--sm admin-row-actions__danger"
                            disabled={isPending}
                            onClick={() => setPending({ id: u.id, name: u.name, nextRole: 'USER' })}
                          >
                            Quitar admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {pending && (
        <div className="confirm-modal__scrim" role="presentation" onClick={() => setPending(null)}>
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="role-title" className="confirm-modal__title">
              {pending.nextRole === 'ADMIN' ? 'Hacer administrador' : 'Quitar administrador'}
            </h2>
            <p className="confirm-modal__lead">
              {pending.nextRole === 'ADMIN' ? (
                <>
                  Vas a darle a <strong>«{pending.name}»</strong> acceso total al panel de admin:
                  podrá crear, editar y borrar lugares, marcas y cambiar roles de otros usuarios.
                </>
              ) : (
                <>
                  Vas a quitarle el acceso de admin a <strong>«{pending.name}»</strong>. Dejará de
                  poder entrar al panel.
                </>
              )}
            </p>
            <div className="confirm-modal__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPending(null)}>
                Cancelar
              </button>
              <button type="button" className="btn btn--primary btn--sm" onClick={confirmChange}>
                {pending.nextRole === 'ADMIN' ? 'Hacer admin' : 'Quitar admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
