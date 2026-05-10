import type { Metadata } from 'next'
import { auth } from '@lib/auth'
import { redirect } from 'next/navigation'
import { container } from '@lib/container'
import { ProfileForm } from './ProfileForm'

export const metadata: Metadata = { title: 'Perfil — Mi cuenta' }

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/mi-cuenta/perfil')

  const { user } = await container
    .getGetUserDashboardUseCase()
    .execute(session.user.id)

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-10)' }}>
        <h1
          className="display"
          style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}
        >
          Perfil
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Tus datos personales.
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
