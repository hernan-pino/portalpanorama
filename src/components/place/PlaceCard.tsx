import Image from 'next/image'
import Link from 'next/link'
import type { PlaceCardView } from '@application/ports/PlaceRepository'
import { SaveHeart } from './SaveHeart'

// Contexto de guardado: si viene, la tarjeta muestra el corazón cableado al flujo
// de listas. Se resuelve una vez por página (sesión + listas + lugares guardados) y
// se pasa a todas las tarjetas; cada una saca su estado "guardado" de savedPlaceIds.
export interface SaveContext {
  isLoggedIn: boolean
  collections: { id: string; name: string; itemCount: number }[]
  savedPlaceIds: string[]
  defaultCollectionId: string | null
  defaultName: string
}

interface Props {
  place: PlaceCardView
  save?: SaveContext
  variant?: 'grid' | 'list'
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
// home y "También te puede gustar". Composición acordada (4E §3): foto 4:3 con rating
// de Google superpuesto + corazón, cuerpo (categoría·comuna · nombre), pie con precio
// compacto + badge de línea de metro. Los opcionales se ocultan con gracia.
export function PlaceCard({ place, save, variant = 'grid' }: Props) {
  const media = (
    <div className="place-card__media">
      {place.coverUrl ? (
        <Image
          src={place.coverUrl}
          alt={place.name}
          fill
          sizes={variant === 'list' ? '120px' : '(max-width: 720px) 50vw, 320px'}
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
      )}
      {place.googleRating != null && (
        <span className="place-card__rating">
          <StarGlyph />
          <span className="num">{place.googleRating.toFixed(1)}</span>
          {place.googleReviewCount != null && (
            <span className="cnt">({fmtCount(place.googleReviewCount)})</span>
          )}
        </span>
      )}
    </div>
  )

  const meta = (
    <>
      <div className="place-card__meta">
        <span>{place.categoryName}</span>
        <span className="dot" aria-hidden="true" />
        <span>{place.neighborhoodName ?? place.communeName}</span>
      </div>
      <h3 className="place-card__title">{place.name}</h3>
    </>
  )

  const foot = (place.priceRange || place.metroLines?.length) ? (
    <div className="place-card__foot">
      {place.priceRange && (
        <span className="place-card__price">{PRICE_COMPACT[place.priceRange] ?? place.priceRange}</span>
      )}
      {place.metroLines && place.metroLines.length > 0 && (
        <span className="place-card__metro">
          {place.metroLines.slice(0, 2).map((l) => (
            <span key={l.code} className="metro-badge" style={{ background: l.color }}>{l.code}</span>
          ))}
        </span>
      )}
    </div>
  ) : null

  return (
    <article className={`place-card place-card--${variant}`}>
      <Link href={`/lugar/${place.slug}`} className="place-card__link">
        {media}
        <div className="place-card__body">
          {meta}
          {foot}
        </div>
      </Link>
      {save && (
        <SaveHeart
          placeId={place.id}
          placeName={place.name}
          isLoggedIn={save.isLoggedIn}
          isSaved={save.savedPlaceIds.includes(place.id)}
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
