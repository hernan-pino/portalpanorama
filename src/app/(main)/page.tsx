import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { SearchBar } from '@components/search/SearchBar'
import { PlaceCard, type SaveContext } from '@components/place/PlaceCard'
import { PlaceRail } from '@components/place/PlaceRail'
import { Collection } from '@domain/collection/Collection'

export const metadata: Metadata = {
  title: 'Portal Panorama — Qué hacer hoy en Santiago',
  description:
    'Descubre, decide y guarda qué hacer en tu ciudad: gastronomía, naturaleza, arte y tiendas. Filtra por con quién vas, presupuesto y comuna.',
}

// Íconos de las 4 categorías activas. El catálogo (GetCategories) aún no trae ícono
// → set propio en el estilo de trazo del sistema (pendiente sumarlo al read-model).
// La clave es el slug real del seed.
const CATEGORY_ICON: Record<string, ReactNode> = {
  gastronomia: (
    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3v6a2 2 0 0 0 4 0V3M9 9v12" />
      <path d="M16.5 3c-1.4 0-2.3 2.2-2.3 4.8 0 2 .9 3.1 2.3 3.2V21" />
    </svg>
  ),
  naturaleza: (
    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 19h18M5 19l4.5-7 3 3.6L16 9l3 10" />
      <circle cx="8" cy="6.5" r="1.6" />
    </svg>
  ),
  'arte-cultura': (
    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 16l4.5-4 3 2.6 4-4.6 5 5.4" />
      <circle cx="8.5" cy="9" r="1.4" />
    </svg>
  ),
  'locales-tiendas': (
    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5.5 8h13l-1 11.5a1 1 0 0 1-1 .9H7.5a1 1 0 0 1-1-.9L5.5 8Z" />
      <path d="M9 9.5V7a3 3 0 0 1 6 0v2.5" />
    </svg>
  ),
  'vida-nocturna': (
    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h14l-7 8z" />
      <path d="M12 12v7" />
      <path d="M8.5 19h7" />
    </svg>
  ),
  'juegos-y-diversion': (
    <svg className="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="9" cy="9" r="1.1" />
      <circle cx="15" cy="9" r="1.1" />
      <circle cx="9" cy="15" r="1.1" />
      <circle cx="15" cy="15" r="1.1" />
    </svg>
  ),
}

export default async function HomePage() {
  const session = await auth()
  const userId = session?.user?.id ?? undefined

  // Recomendados (orden por reputación) + catálogo de categorías + facetas (para los
  // chips sociales). El corazón de la tarjeta necesita las colecciones del usuario.
  const [recommended, categories, facets] = await Promise.all([
    container.getSearchPlacesUseCase().execute({ limit: 12 }),
    container.getGetCategoriesUseCase().execute(),
    container.getGetPlaceFacetsUseCase().execute(),
  ])

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

  // Chips de "¿con quién?" (capa AUDIENCE) → explorar ya filtrado por contexto. Se ocultan los
  // vacíos (principio P3: disimular la baja densidad del arranque).
  const social = facets.social.filter((s) => s.count > 0)
  const places = recommended.items

  return (
    <div className="home page-enter">

      {/* ── Hero editorial: título + búsqueda ── */}
      <section className="home-hero container">
        <h1 className="home-hero__title">
          ¿Qué <em>hacer</em> hoy en Santiago?
        </h1>
        <p className="home-hero__sub">
          Lugares reales de la ciudad para cualquier plan. Filtra por con quién vas hoy y ve directo a explorar.
        </p>
        <div className="home-hero__search">
          <SearchBar />
        </div>
      </section>

      {/* ── ¿Con quién vas? — fila social (secundaria, lleva a explorar filtrado) ── */}
      {social.length > 0 && (
        <section className="home-social container">
          <div className="home-social__head">
            <h2 className="home-social__title">¿Con quién vas?</h2>
            <span className="home-social__note">filtra por contexto</span>
          </div>
          <div className="home-social__chips">
            {social.map((s) => (
              <Link key={s.value} href={`/explorar?con=${s.value}`} className="home-social__chip">
                {s.label}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Explorá por categoría — el protagonista (banda + tarjetas grandes) ── */}
      <section className="home-cats">
        <div className="home-cats__inner container">
          <div className="home-cats__head">
            <h2 className="home-cats__title">Explorá por categoría</h2>
            <span className="home-cats__note">{categories.length} mundos</span>
          </div>
          <div className="home-cat-grid">
            {categories.map((c) => (
              <Link key={c.slug} href={`/explorar?categoria=${c.slug}`} className="home-cat">
                <span className="home-cat__icon">{CATEGORY_ICON[c.slug] ?? CATEGORY_ICON.gastronomia}</span>
                <span className="home-cat__name">{c.name}</span>
                <ArrowIcon className="home-cat__arrow" size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lo mejor valorado — carrusel de tarjetas (reusa PlaceCard) ── */}
      {places.length > 0 && (
        <section className="home-rec container">
          <div className="home-sec__head">
            <h2 className="home-sec__title">Lo mejor valorado</h2>
            <Link href="/explorar" className="home-sec__action">
              Ver todo <ArrowIcon size={15} />
            </Link>
          </div>
          <PlaceRail>
            {places.map((place) => (
              <div key={place.id} className="home-rail__item">
                <PlaceCard place={place} save={save} />
              </div>
            ))}
          </PlaceRail>
        </section>
      )}

      {/* Listas curadas (brief §5, opcional): diferidas — falta un read-model
          "listar curadas" (hoy solo GetCuratedCollection by slug) y data sembrada.
          Fast-follow SEO post-4E. */}

    </div>
  )
}

function ArrowIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}
