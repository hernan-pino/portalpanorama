'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

// Botón flotante "volver arriba". Aparece al bajar (>600px) y sube suave. Útil en las
// páginas largas (guías, explorar, home). En la ficha de lugar (/lugar/...) no se
// muestra: ahí ya hay una barra de acción pegada abajo en móvil y chocarían.
export function ScrollToTop() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname?.startsWith('/lugar/')) return null
  if (!visible) return null

  return (
    <button
      type="button"
      className="scroll-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
