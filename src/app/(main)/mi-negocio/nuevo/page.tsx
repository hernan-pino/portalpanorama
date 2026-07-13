import type { Metadata } from 'next'
import Link from 'next/link'
import { auth, googleAuthEnabled } from '@lib/auth'
import { container } from '@lib/container'
import { GoogleButton } from '@/app/(auth)/GoogleButton'
import { PublishWizard } from './PublishWizard'

export const metadata: Metadata = {
  title: 'Publica tu negocio',
  robots: { index: false }, // página de flujo, no de contenido
}

// Tercera puerta de entrada de un lugar (BUSINESS_ACCOUNTS_SPEC §6): el dueño de un
// negocio que NO está en el directorio manda su semilla. NO exige sesión previa —
// crear la cuenta es el paso 1 del propio wizard, para no cortar el flujo mandándolo
// a /registro y de vuelta.
export default async function NuevoNegocioPage() {
  const [session, { categories, communes }] = await Promise.all([
    auth(),
    container.getGetSeedFormOptionsUseCase().execute(),
  ])

  return (
    <div className="legal container">
      <p className="eyebrow">Para negocios</p>
      <h1 className="display legal__title">Publica tu negocio</h1>

      <p className="legal__lead">
        Es gratis y toma un par de minutos.{' '}
        <strong>¿Tu local ya está en Portal Panorama?</strong>{' '}
        <Link href="/explorar">Búscalo y reclámalo</Link> en vez de crearlo de nuevo.
      </p>

      <PublishWizard
        isAuthenticated={!!session?.user?.id}
        googleEnabled={googleAuthEnabled}
        googleButton={<GoogleButton label="Continuar con Google" divider="below" redirectTo="/mi-negocio/nuevo" />}
        categories={categories}
        communes={communes}
      />
    </div>
  )
}
