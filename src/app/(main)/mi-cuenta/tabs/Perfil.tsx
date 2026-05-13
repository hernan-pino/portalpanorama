import { ProfileForm } from '../perfil/ProfileForm'
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
        rut={user.rut?.formatted}
      />
    </div>
  )
}
