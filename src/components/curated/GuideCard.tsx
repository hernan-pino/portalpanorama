import Image from 'next/image'
import Link from 'next/link'
import type { CuratedListCardView } from '@application/ports/CuratedListRepository'

// Tarjeta de guía curada (home + /guias). La portada va por next/image con `sizes`
// ajustado a la grilla (1 col ≤560px, 2 col ≤860px, 3 col desktop): la foto original
// del Blob pesa ~1500px y servirla cruda costaba ~130KB extra por tarjeta en móvil.
export function GuideCard({ list }: { list: CuratedListCardView }) {
  return (
    <Link href={`/lista/${list.slug}`} className="guide-card">
      <span className="guide-card__media">
        {list.coverImageUrl ? (
          <Image
            src={list.coverImageUrl}
            alt={list.name}
            fill
            sizes="(max-width: 560px) 92vw, (max-width: 860px) 46vw, 400px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
        )}
      </span>
      <span className="guide-card__body">
        <span className="guide-card__name">{list.name}</span>
        {list.description && <span className="guide-card__desc">{list.description}</span>}
      </span>
    </Link>
  )
}
