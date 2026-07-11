import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { getPlaceDetailCached } from '@lib/cachedReads'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { ClaimForm } from './ClaimForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Reclama tu ficha',
  robots: { index: false }, // página de flujo, no de contenido
}

// "¿Este negocio es tuyo?" — formulario de reclamo (BUSINESS_ACCOUNTS_SPEC §6).
// Requiere sesión: el reclamo pertenece a un User; el admin lo revisa a mano.
export default async function ReclamarPage({ params }: PageProps) {
  const { slug } = await params

  const session = await auth()
  if (!session?.user) redirect(`/login?callbackUrl=/reclamar/${slug}`)

  let place
  try {
    place = (await getPlaceDetailCached(slug)).place
  } catch (err) {
    if (err instanceof PlaceNotFoundError) notFound()
    throw err
  }

  return (
    <div className="legal container">
      <p className="eyebrow">Para negocios</p>
      <h1 className="display legal__title">Reclama la ficha de {place.name}</h1>

      <p className="legal__lead">
        Si eres parte del equipo de <strong>{place.name}</strong>, cuéntanos tu rol y déjanos un
        contacto. Para verificarte te pediremos un mensaje desde el canal oficial del local
        (te explicamos cómo abajo) y te avisamos por correo apenas quede aprobado.{' '}
        <Link href="/para-negocios">Saber más sobre las cuentas de negocio</Link>.
      </p>

      <ClaimForm slug={slug} placeName={place.name} defaultEmail={session.user.email ?? ''} />
    </div>
  )
}
