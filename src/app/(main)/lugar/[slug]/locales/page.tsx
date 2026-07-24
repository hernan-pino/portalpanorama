import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPlaceDetailCached } from '@lib/cachedReads'
import type { PlaceDetailView } from '@application/ports/PlaceRepository'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { PlaceCard } from '@components/place/PlaceCard'
import { PointsList } from '../PointsList'

// Todos los locales de un lugar contenedor (mall, patio gastronómico, parque).
// La ficha del padre solo muestra una vista previa: un recinto grande tiene decenas
// de locales (el MUT, 93) y apilarlos ahí la volvía interminable. Acá viven todos,
// con URL propia e indexable.

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  let place: PlaceDetailView
  try {
    place = (await getPlaceDetailCached(slug)).place
  } catch {
    return { title: 'Lugar no encontrado' }
  }

  const title = `Locales de ${place.name}`
  const description =
    `Todos los locales de ${place.name}, ${place.commune.name}: ` +
    `${place.children.length} lugares con ficha en Portal Panorama.`

  return {
    title,
    description,
    alternates: { canonical: `/lugar/${place.slug}/locales` },
    openGraph: { title, description, url: `/lugar/${place.slug}/locales` },
  }
}

export default async function PlaceChildrenPage({ params }: PageProps) {
  const { slug } = await params

  let place: PlaceDetailView
  try {
    place = (await getPlaceDetailCached(slug)).place
  } catch (error) {
    if (error instanceof PlaceNotFoundError) notFound()
    throw error
  }

  // Un lugar sin locales ni spots no tiene esta página: se vuelve a su ficha.
  if (place.children.length === 0 && place.points.length === 0) notFound()

  return (
    <main className="brand-page">
      <header className="brand-page__head">
        <Link href={`/lugar/${place.slug}`} className="ficha__parent">
          ← Volver a {place.name}
        </Link>
        <h1 className="brand-page__name">Locales de {place.name}</h1>
        <p className="brand-page__desc">
          {place.commune.name}
          {place.address ? ` · ${place.address}` : ''}
        </p>
      </header>

      <section className="brand-page__places">
        <h2 className="brand-page__sec-h">
          {place.children.length === 1 ? '1 local' : `${place.children.length} locales`}
        </h2>

        {place.children.length > 0 ? (
          <div className="results-grid">
            {place.children.map((child) => (
              <PlaceCard key={child.id} place={child} />
            ))}
          </div>
        ) : (
          <p className="brand-page__empty">
            Este lugar todavía no tiene locales publicados.
          </p>
        )}

        {/* Spots sin ficha propia (miradores, kioscos): parte de lo que hay adentro. */}
        {place.points.length > 0 && <PointsList points={place.points} />}
      </section>
    </main>
  )
}
