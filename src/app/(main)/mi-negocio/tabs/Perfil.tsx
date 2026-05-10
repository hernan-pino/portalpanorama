import type { User } from '@domain/user/User'
import { ProfileForm } from '../../mi-cuenta/perfil/ProfileForm'

export function TabPerfil({ user }: { user: User }) {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>Mi perfil</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Tus datos personales y de contacto.
        </p>
      </div>

      <ProfileForm
        name={user.name}
        email={user.email.value}
        rut={user.rut?.formatted}
      />
    </div>
  )
}
