import Image from 'next/image'
import Link from 'next/link'
import type { PlaceCardView } from '@application/ports/PlaceRepository'
import { SaveHeart } from './SaveHeart'
import { PlaceDistance } from '@components/geo/PlaceDistance'

// Contexto de guardado: si viene, la tarjeta muestra el corazón cableado al flujo
// de listas. Se resuelve una vez por página (sesión + listas + lugares guardados) y
// se pasa a todas las tarjetas; cada una saca su estado "guardado" de savedPlaceIds.
export interface SaveContext {
  isLoggedIn: boolean
  collections: { id: string; name: string; itemCount: number }[]
  savedPlaceIds: string[]
  // Pares (lista, lugar) guardados → cada tarjeta deriva en qué listas está (s27).
  savedItems: { collectionId: string; placeId: string }[]
  defaultCollectionId: string | null
  defaultName: string
}

interface Props {
  place: PlaceCardView
  save?: SaveContext
  variant?: 'grid' | 'list'
  // El carrusel del home usa tarjetas angostas: ahí la distancia empuja la fila de
  // datos a una segunda línea y se ve apretada. Se apaga por página (s38).
  showDistance?: boolean
}

// Precio compacto: bucket → símbolo escaneable ($…$$$$, Gratis como texto).
const PRICE_COMPACT: Record<string, string> = {
  FREE: 'Gratis',
  UNDER_5000: '$',
  FROM_5000_TO_15000: '$$',
  FROM_15000_TO_30000: '$$$',
  OVER_30000: '$$$$',
}

const fmtCount = (n: number) => n.toLocaleString('es-CL')

// La tarjeta de lugar (mini-ficha). Componente más repetido del producto: explorar,
// home y "También te puede gustar". Rediseño s35: foto enmarcada (la decisión se lee
// en el cuerpo, no en la foto), rating de Google bajado a la fila de datos, y metro
// como punto de color (no círculo lleno). Los tags de contexto se probaron en la
// grilla y se descartaron por decisión del usuario (s35): recargaban la tarjeta.
export function PlaceCard({ place, save, variant = 'grid', showDistance = true }: Props) {
  const media = (
    <div className="place-card__media">
      {place.coverUrl ? (
        <Image
          src={place.coverUrl}
          alt={place.name}
          fill
          sizes={variant === 'list' ? '132px' : '(max-width: 720px) 50vw, 320px'}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
      )}
    </div>
  )

  const body = (
    <div className="place-card__body">
      <span className="place-card__kicker">
        <span>{place.categoryName}</span>
        <span className="dot" aria-hidden="true" />
        <span>{place.neighborhoodName ?? place.communeName}</span>
      </span>
      <h3 className="place-card__title">{place.name}</h3>

      <div className="place-card__meta">
        {place.googleRating != null && (
          <span className="rating">
            <span className="rating__star"><StarGlyph /></span>
            <span className="rating__val">{place.googleRating.toFixed(1)}</span>
            {place.googleReviewCount != null && (
              <span className="rating__count">({fmtCount(place.googleReviewCount)})</span>
            )}
          </span>
        )}
        {place.priceRange && (
          <span className="price">{PRICE_COMPACT[place.priceRange] ?? place.priceRange}</span>
        )}
        {place.metroLines && place.metroLines.length > 0 && (
          <span className="place-card__metro">
            {place.metroLines.slice(0, 2).map((l) => (
              <span key={l.code} className="metro">
                <span className="metro__dot" style={{ background: l.color }} aria-hidden="true" />
                {l.code}
              </span>
            ))}
          </span>
        )}
        {showDistance && (
          <PlaceDistance lat={place.lat} lng={place.lng} className="place-card__dist" />
        )}
      </div>
    </div>
  )

  return (
    <article className={`place-card place-card--${variant}`}>
      <Link href={`/lugar/${place.slug}`} className="place-card__link">
        {media}
        {body}
      </Link>
      {save && (
        <SaveHeart
          placeId={place.id}
          placeName={place.name}
          isLoggedIn={save.isLoggedIn}
          isSaved={save.savedPlaceIds.includes(place.id)}
          savedInIds={save.savedItems.filter((i) => i.placeId === place.id).map((i) => i.collectionId)}
          collections={save.collections}
          defaultCollectionId={save.defaultCollectionId}
          defaultName={save.defaultName}
        />
      )}
    </article>
  )
}

function StarGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor" aria-hidden="true">
      <path d="M10 1.6l2.47 5.18 5.7.72-4.2 3.9 1.1 5.64L10 14.3l-5.07 2.74 1.1-5.64-4.2-3.9 5.7-.72z" />
    </svg>
  )
}
