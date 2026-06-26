import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import type { CuratedListPageView } from '@application/ports/CuratedListRepository'
import { CuratedListNotFoundError } from '@domain/curatedList/errors/CuratedListNotFoundError'
import { Collection } from '@domain/collection/Collection'
import { PlaceCard, type SaveContext } from '@components/place/PlaceCard'
import { curatedListJsonLd } from './jsonLd'

interface PageProps {
  params: Promise<{ slug: string }>
}

const KIND_EYEBROW: Record<string, string> = { GUIDE: 'Guía', OCCASION: 'Lista' }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  let list: CuratedListPageView
  try {
    list = await container.getGetCuratedListBySlugUseCase().execute(slug)
  } catch {
    return { title: 'Lista no encontrada' }
  }

  const title = list.name
  const description = list.description?.slice(0, 160) ?? `${list.total} lugares de Santiago en una guía curada.`
  const path = `/lista/${slug}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title,
      description,
      url: path,
      images: list.coverImageUrl ? [{ url: list.coverImageUrl, alt: list.name }] : undefined,
    },
  }
}

export default async function ListaPage({ params }: PageProps) {
  const { slug } = await params

  let list: CuratedListPageView
  try {
    list = await container.getGetCuratedListBySlugUseCase().execute(slug)
  } catch (error) {
    if (error instanceof CuratedListNotFoundError) notFound()
    throw error
  }

  // Contexto de guardado (corazones), igual que la home: una sola resolución por página.
  const session = await auth()
  const userId = session?.user?.id ?? undefined
  let save: SaveContext = {
    isLoggedIn: !!userId, collections: [], savedPlaceIds: [],
    defaultCollectionId: null, defaultName: Collection.DEFAULT_NAME,
  }
  if (userId) {
    const ctx = await container.getGetSaveContextUseCase().execute(userId)
    save = {
      isLoggedIn: true,
      collections: ctx.collections.map((c) => ({ id: c.id, name: c.name, itemCount: c.itemCount })),
      savedPlaceIds: ctx.savedPlaceIds,
      defaultCollectionId: ctx.defaultCollectionId,
      defaultName: Collection.DEFAULT_NAME,
    }
  }

  return (
    <div className="curated-page page-enter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(curatedListJsonLd(list)) }}
      />

      <header className="curated-page__head">
        {list.coverImageUrl && (
          <div className="curated-page__cover">
            <Image src={list.coverImageUrl} alt={list.name} fill sizes="(max-width: 900px) 100vw, 900px" style={{ objectFit: 'cover' }} priority />
          </div>
        )}
        <div className="curated-page__head-body">
          <p className="eyebrow">{KIND_EYEBROW[list.kind] ?? 'Lista'}</p>
          <h1 className="curated-page__title">{list.name}</h1>
          {list.intro && <p className="curated-page__intro">{list.intro}</p>}
          <p className="curated-page__count">
            {list.total === 1 ? '1 lugar' : `${list.total} lugares`}
          </p>
        </div>
      </header>

      {/* Destacados (con bajada editorial) */}
      {list.pinned.length > 0 && (
        <section className="curated-page__section">
          <div className="results-grid">
            {list.pinned.map(({ place, blurb }) => (
              <div key={place.id} className="curated-pin">
                <PlaceCard place={place} save={save} />
                {blurb && <p className="curated-pin__blurb">{blurb}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Resto de la regla */}
      {list.rest.length > 0 && (
        <section className="curated-page__section">
          {list.pinned.length > 0 && <h2 className="curated-page__sec-h">Más lugares</h2>}
          <div className="results-grid">
            {list.rest.map((place) => (
              <PlaceCard key={place.id} place={place} save={save} />
            ))}
          </div>
        </section>
      )}

      {list.total === 0 && (
        <p className="curated-page__empty">
          Esta lista todavía no tiene lugares publicados que cumplan su regla.
        </p>
      )}
    </div>
  )
}
