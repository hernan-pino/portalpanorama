import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { getCuratedListPageCached } from '@lib/cachedReads'
import type { CuratedListPageView } from '@application/ports/CuratedListRepository'
import type { SaveContextOutput } from '@application/collection/GetSaveContextUseCase'
import { CuratedListNotFoundError } from '@domain/curatedList/errors/CuratedListNotFoundError'
import { Collection } from '@domain/collection/Collection'
import { type SaveContext } from '@components/place/PlaceCard'
import { PaginatedRest } from './PaginatedRest'
import { curatedListJsonLd } from './jsonLd'

interface PageProps {
  params: Promise<{ slug: string }>
}

const KIND_EYEBROW: Record<string, string> = { GUIDE: 'Guía', OCCASION: 'Lista' }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  let list: CuratedListPageView
  try {
    // Cacheada + dedupeada: page comparte esta misma ejecución (React cache).
    list = await getCuratedListPageCached(slug)
  } catch {
    return { title: 'Lista no encontrada' }
  }

  const title = list.name
  // SEO: la meta description parte con el título de la guía cuando el texto no lo trae.
  const body = list.description?.replace(/\s+/g, ' ').trim()
  const description = body
    ? (body.toLowerCase().includes(list.name.toLowerCase()) ? body : `${list.name}: ${body}`).slice(0, 160)
    : `${list.name}: ${list.total} lugares de Santiago en una guía curada.`
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

  // La guía y el contexto de guardado (corazones) no dependen entre sí: van en
  // paralelo (el contexto solo si hay sesión), igual que en la ficha de lugar.
  const session = await auth()
  const userId = session?.user?.id ?? undefined

  let list: CuratedListPageView
  let ctx: SaveContextOutput | null
  try {
    ;[list, ctx] = await Promise.all([
      getCuratedListPageCached(slug),
      userId ? container.getGetSaveContextUseCase().execute(userId) : Promise.resolve(null),
    ])
  } catch (error) {
    if (error instanceof CuratedListNotFoundError) notFound()
    throw error
  }

  let save: SaveContext = {
    isLoggedIn: !!userId, collections: [], savedPlaceIds: [],
    defaultCollectionId: null, defaultName: Collection.DEFAULT_NAME,
  }
  if (ctx) {
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

      {/* Destacados: filas editoriales (imagen · nombre · descripción · data · ver ficha) */}
      {list.pinned.length > 0 && (
        <section className="curated-page__section">
          <div className="curated-features">
            {list.pinned.map(({ place, blurb }, idx) => (
              <article key={place.id} className="curated-feature">
                <Link href={`/lugar/${place.slug}`} className="curated-feature__media" aria-label={`Ver ficha de ${place.name}`}>
                  {place.coverUrl ? (
                    <Image src={place.coverUrl} alt={place.name} fill sizes="(max-width: 760px) 100vw, 320px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <span className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
                  )}
                </Link>

                <div className="curated-feature__body">
                  <h2 className="curated-feature__name">
                    <span className="curated-feature__num">{idx + 1}</span>
                    <Link href={`/lugar/${place.slug}`}>{place.name}</Link>
                  </h2>

                  <div className="curated-feature__facts">
                    {place.googleRating != null && (
                      <span className="curated-feature__fact">
                        <StarGlyph />
                        <span className="num">{place.googleRating.toFixed(1)}</span>
                        {place.googleReviewCount != null && (
                          <span className="cnt">({place.googleReviewCount.toLocaleString('es-CL')})</span>
                        )}
                      </span>
                    )}
                    {place.metroLines && place.metroLines.length > 0 && (
                      <span className="curated-feature__fact">
                        {place.metroLines.slice(0, 2).map((l) => (
                          <span key={l.code} className="metro-badge" style={{ background: l.color }}>{l.code}</span>
                        ))}
                      </span>
                    )}
                    {place.schedule && (
                      <span className="curated-feature__fact curated-feature__schedule">
                        <ClockGlyph />
                        <span>{place.schedule}</span>
                      </span>
                    )}
                  </div>

                  {blurb && (
                    <div className="curated-feature__text">
                      {blurb.split(/\n+/).map((p) => p.trim()).filter(Boolean).map((p, i) => (
                        <p key={i}>{renderInline(p)}</p>
                      ))}
                    </div>
                  )}

                  <Link href={`/lugar/${place.slug}`} className="curated-feature__cta">
                    Ver ficha completa en Portal Panorama →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Menciones honoríficas: nivel intermedio (notorios, sin ensayo). Banda compacta. */}
      {list.mentions.length > 0 && (
        <section className="curated-page__section">
          <h2 className="curated-page__sec-h">Menciones honoríficas</h2>
          <ul className="curated-mentions">
            {list.mentions.map(({ place, note }) => (
              <li key={place.id} className="curated-mention">
                <Link href={`/lugar/${place.slug}`} className="curated-mention__thumb" aria-label={`Ver ficha de ${place.name}`}>
                  {place.coverUrl ? (
                    <Image src={place.coverUrl} alt={place.name} fill sizes="72px" style={{ objectFit: 'cover' }} />
                  ) : (
                    <span className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
                  )}
                </Link>
                <div className="curated-mention__body">
                  <h3 className="curated-mention__name">
                    <Link href={`/lugar/${place.slug}`}>{place.name}</Link>
                    {place.googleRating != null && (
                      <span className="curated-mention__rating">
                        <StarGlyph />
                        <span className="num">{place.googleRating.toFixed(1)}</span>
                      </span>
                    )}
                  </h3>
                  {note && <p className="curated-mention__note">{renderInline(note)}</p>}
                </div>
                <Link href={`/lugar/${place.slug}`} className="curated-mention__cta" aria-hidden="true">→</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Resto de la regla — paginado client-side (sin recargar; la data ya está acá) */}
      {list.rest.length > 0 && (
        <section className="curated-page__section">
          {(list.pinned.length > 0 || list.mentions.length > 0) && (
            <h2 className="curated-page__sec-h">{list.name}: más lugares</h2>
          )}
          <PaginatedRest places={list.rest} save={save} />
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

// Negrita escaneable: convierte **texto** en <strong> dentro de un párrafo. Sin HTML
// crudo (split + map), así el texto del admin es seguro aunque venga de un textarea.
function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    const m = /^\*\*([^*]+)\*\*$/.exec(part)
    return m ? <strong key={i}>{m[1]}</strong> : part
  })
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d="M10 1.6l2.47 5.18 5.7.72-4.2 3.9 1.1 5.64L10 14.3l-5.07 2.74 1.1-5.64-4.2-3.9 5.7-.72z" />
    </svg>
  )
}

function ClockGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}
