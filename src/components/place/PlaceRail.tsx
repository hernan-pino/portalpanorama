'use client'
import { useRef, useState, useEffect, type ReactNode } from 'react'

// Carrusel horizontal con controles de flecha (desktop). En móvil se navega con
// swipe → las flechas se ocultan por CSS. Las tarjetas se renderizan en el server
// (PlaceCard usa next/image) y entran como children; acá solo va el scroll + flechas.
// `scrollClassName` permite reusarlo con otro contenedor de scroll (la home usa
// `home-rail`; la ficha reusa su `ficha__rel`); `className` se suma al wrapper para
// ajustar la posición de las flechas por contexto.
export function PlaceRail({
  children,
  scrollClassName = 'home-rail',
  className,
}: {
  children: ReactNode
  scrollClassName?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  function update() {
    const el = ref.current
    if (!el) return
    setAtStart(el.scrollLeft <= 1)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1)
  }

  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  function scroll(dir: -1 | 1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <div className={className ? `rail-wrap ${className}` : 'rail-wrap'}>
      <button type="button" className="rail-arrow rail-arrow--prev" onClick={() => scroll(-1)} aria-label="Anterior" disabled={atStart}>
        <Chevron dir="left" />
      </button>
      <div className={scrollClassName} ref={ref}>
        {children}
      </div>
      <button type="button" className="rail-arrow rail-arrow--next" onClick={() => scroll(1)} aria-label="Siguiente" disabled={atEnd}>
        <Chevron dir="right" />
      </button>
    </div>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === 'left' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  )
}
