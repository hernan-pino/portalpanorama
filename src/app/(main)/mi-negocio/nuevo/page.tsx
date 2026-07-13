import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { SeedForm } from './SeedForm'

export const metadata: Metadata = {
  title: 'Publica tu negocio',
  robots: { index: false }, // página de flujo, no de contenido
}

// Tercera puerta de entrada de un lugar (BUSINESS_ACCOUNTS_SPEC §6): el dueño de un
// negocio que NO está en el directorio manda su semilla. Requiere sesión — sin cuenta
// pasa antes por /registro, que vuelve acá con el callbackUrl.
export default async function NuevoNegocioPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/registro?callbackUrl=/mi-negocio/nuevo')

  const { categories, communes } = await container.getGetSeedFormOptionsUseCase().execute()

  return (
    <div className="legal container">
      <p className="onboard-step">Paso 2 de 2 · Publica tu negocio</p>
      <h1 className="display legal__title">Cuéntanos de tu local</h1>

      <p className="legal__lead">
        Solo lo básico: con eso <strong>nosotros investigamos tu negocio y armamos su ficha
        completa</strong> (fotos, descripción, horario, cómo llegar) y la publicamos. Si algo nos
        queda mal, <strong>tú mismo lo corriges</strong> después desde tu panel. Es gratis.{' '}
        <strong>¿Tu local ya está en Portal Panorama?</strong>{' '}
        <Link href="/explorar">Búscalo y reclámalo</Link> en vez de crearlo de nuevo.
      </p>

      <SeedForm categories={categories} communes={communes} />
    </div>
  )
}
