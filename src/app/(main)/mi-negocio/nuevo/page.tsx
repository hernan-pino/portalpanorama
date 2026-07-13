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
      <p className="eyebrow">Para negocios</p>
      <h1 className="display legal__title">Publica tu negocio</h1>

      <p className="legal__lead">
        Cuéntanos lo básico de tu local y nosotros armamos la ficha completa: la investigamos,
        le sumamos fotos, descripción y horario, y la publicamos. Es gratis.{' '}
        <strong>¿Tu local ya está en Portal Panorama?</strong>{' '}
        <Link href="/explorar">Búscalo y reclámalo</Link> en vez de crearlo de nuevo.
      </p>

      <SeedForm categories={categories} communes={communes} />
    </div>
  )
}
