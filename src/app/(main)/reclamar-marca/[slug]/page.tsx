import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { BrandNotFoundError } from '@domain/brand/errors/BrandNotFoundError'
// El formulario de reclamo es compartido (lugar y marca): se reusa el de /reclamar.
import { ClaimForm } from '../../reclamar/[slug]/ClaimForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Reclama tu marca',
  robots: { index: false },
}

// "¿Esta marca es tuya?" — reclamo de una Brand (cadena con varios locales).
// Al aprobarse, la marca queda asociada a la cuenta; sus sucursales cuelgan de ella.
export default async function ReclamarMarcaPage({ params }: PageProps) {
  const { slug } = await params

  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/reclamar-marca/${slug}`)

  let brand
  try {
    brand = await container.getGetBrandPageUseCase().execute(slug)
  } catch (err) {
    if (err instanceof BrandNotFoundError) notFound()
    throw err
  }

  return (
    <div className="legal container">
      <p className="eyebrow">Para negocios</p>
      <h1 className="display legal__title">Reclama la marca {brand.name}</h1>

      <p className="legal__lead">
        Si gestionas <strong>{brand.name}</strong> y sus {brand.places.length}{' '}
        {brand.places.length === 1 ? 'local' : 'locales'}, cuéntanos tu rol y déjanos un
        contacto. Reclamar la marca te da la gestión de la cadena completa.{' '}
        <Link href="/para-negocios">Saber más sobre las cuentas de negocio</Link>.
      </p>

      <ClaimForm
        kind="brand"
        slug={slug}
        targetName={brand.name}
        defaultEmail={session.user.email ?? ''}
        backHref={`/marca/${slug}`}
      />
    </div>
  )
}
