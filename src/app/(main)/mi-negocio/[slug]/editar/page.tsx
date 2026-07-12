import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { UnauthorizedBusinessAccessError } from '@domain/business/errors/UnauthorizedBusinessAccessError'
import { EditPlaceForm } from './EditPlaceForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Editar ficha',
  robots: { index: false },
}

// Edición de la ficha por el dueño verificado (campos operacionales). El guard de
// ownership vive en el use case; aquí solo mapeamos el error a 404/redirect.
export default async function EditarFichaPage({ params }: PageProps) {
  const { slug } = await params

  const session = await auth()
  if (!session?.user?.id) redirect(`/login?callbackUrl=/mi-negocio/${slug}/editar`)

  let place
  try {
    place = await container.getGetOwnedPlaceForEditUseCase().execute(session.user.id, slug)
  } catch (err) {
    if (err instanceof UnauthorizedBusinessAccessError) redirect('/mi-negocio')
    if (err instanceof PlaceNotFoundError) notFound()
    throw err
  }

  return (
    <div className="legal container">
      <p className="eyebrow">
        <Link href="/mi-negocio">← Mi negocio</Link>
      </p>
      <h1 className="display legal__title">Editar {place.name}</h1>

      <div className="claim-verify" style={{ marginBottom: 'var(--s-5)', maxWidth: 560 }}>
        <p className="claim-verify__title">Tu ficha ya está optimizada ✨</p>
        <p className="claim-verify__body">
          Nuestro equipo cuidó esta ficha para que se vea y posicione bien. Te recomendamos usar
          este editor solo para <strong>corregir información errónea o desactualizada</strong>
          {' '}(horario, teléfono, precios) y <strong>sumar tus fotos</strong>. El nombre, la
          categoría y la ubicación los gestiona nuestro equipo — si necesitas cambiarlos, escríbenos
          a <a href="mailto:hola@portalpanorama.cl">hola@portalpanorama.cl</a>.
        </p>
      </div>

      <EditPlaceForm
        slug={place.slug}
        initial={{
          description: place.description ?? '',
          schedule: place.schedule ?? '',
          phone: place.phone ?? '',
          website: place.website ?? '',
          instagram: place.instagram ?? '',
          menuUrl: place.menuUrl ?? '',
          priceRange: place.priceRange ?? '',
          reservation: place.reservation ?? '',
          accessDetail: place.accessDetail ?? '',
          reference: place.reference ?? '',
        }}
      />
    </div>
  )
}
