'use client'
import { useRef } from 'react'

export function FeaturedSlider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  function scroll(dir: 'prev' | 'next') {
    if (!ref.current) return
    const cardWidth = (ref.current.firstElementChild as HTMLElement)?.offsetWidth ?? 280
    const gap = 16
    ref.current.scrollBy({ left: dir === 'next' ? cardWidth + gap : -(cardWidth + gap), behavior: 'smooth' })
  }

  return (
    <div className="featured-slider">
      <div className="featured-grid" ref={ref}>
        {children}
      </div>
      <div className="featured-slider__controls" aria-hidden="true">
        <button onClick={() => scroll('prev')} className="featured-slider__btn" aria-label="Anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="m11 18-6-6 6-6" />
          </svg>
        </button>
        <button onClick={() => scroll('next')} className="featured-slider__btn" aria-label="Siguiente">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
