import { ProfileForm } from '../perfil/ProfileForm'
import { ChangePasswordForm } from '../perfil/ChangePasswordForm'
import type { User } from '@domain/user/User'

export function TabPerfil({ user }: { user: User }) {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
          Mi <em>perfil</em>
        </h1>
      </div>

      <ProfileForm
        name={user.name}
        email={user.email.value}
      />

      <hr
        style={{
          margin: 'var(--s-10) 0',
          maxWidth: 480,
          border: 0,
          borderTop: '1px solid var(--surface-line)',
        }}
      />

      <div style={{ marginBottom: 'var(--s-6)' }}>
        <h2 className="display" style={{ fontSize: 'var(--t-h3)', marginBottom: 'var(--s-1)' }}>
          Seguridad
        </h2>
        <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>
          Cambiá la contraseña con la que iniciás sesión.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  )
}
