'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface GalleryImage { url: string; alt?: string; credit?: string }

interface Props {
  images: GalleryImage[]
  name: string
  actions?: React.ReactNode // slot para los FABs sobre el hero (compartir)
}

// Galería de la ficha: hero + miniaturas + lightbox navegable (anterior/siguiente,
// teclado, zoom al click, contador y crédito). Cliente porque es interactiva.
export function Gallery({ images, name, actions }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const total = images.length
  const cover = images[0]

  const close = useCallback(() => { setOpen(false); setZoom(false) }, [])
  const go = useCallback((d: number) => { setZoom(false); setIndex((p) => (p + d + total) % total) }, [total])
  const openAt = (i: number) => { if (total === 0) return; setIndex(i); setZoom(false); setOpen(true) }

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow }
  }, [open, close, go])

  return (
    <>
      <div className="ficha__hero">
        {cover ? (
          <button type="button" className="ficha__hero-img" onClick={() => openAt(0)} aria-label="Ampliar foto">
            <Image src={cover.url} alt={cover.alt ?? name} fill priority fetchPriority="high" sizes="100vw" style={{ objectFit: 'cover' }} />
          </button>
        ) : (
          <div className="ficha__hero-img">
            <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
          </div>
        )}
        {actions && <div className="ficha__hero-fabs">{actions}</div>}
        {total > 1 && <span className="ficha__counter">01 / {String(total).padStart(2, '0')}</span>}
        {cover?.credit && <span className="ficha__credit">{cover.credit}</span>}
      </div>

      {total > 1 && (
        <div className="ficha__thumbs-wrap">
          <div className="ficha__thumbs">
            {images.slice(1).map((img, i) => (
              <button key={i} type="button" className="ficha__thumb" onClick={() => openAt(i + 1)} aria-label={`Ver foto ${i + 2}`}>
                <Image src={img.url} alt={img.alt ?? name} fill sizes="80px" style={{ objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {open && cover && (
        <div className="ficha__lb" role="dialog" aria-modal="true" onClick={close}>
          <button type="button" className="ficha__lb-btn ficha__lb-close" onClick={close} aria-label="Cerrar">✕</button>
          {total > 1 && (
            <button type="button" className="ficha__lb-btn ficha__lb-prev" aria-label="Anterior"
              onClick={(e) => { e.stopPropagation(); go(-1) }}>‹</button>
          )}
          <figure className="ficha__lb-fig" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index].url}
              alt={images[index].alt ?? name}
              className={`ficha__lb-img${zoom ? ' is-zoom' : ''}`}
              onClick={() => setZoom((z) => !z)}
            />
            <figcaption className="ficha__lb-cap">
              <span className="mono">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
              {images[index].credit && <span>{images[index].credit}</span>}
            </figcaption>
          </figure>
          {total > 1 && (
            <button type="button" className="ficha__lb-btn ficha__lb-next" aria-label="Siguiente"
              onClick={(e) => { e.stopPropagation(); go(1) }}>›</button>
          )}
        </div>
      )}
    </>
  )
}
