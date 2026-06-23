'use client'
import { useEffect, useState } from 'react'

// Barra de acción fija (solo móvil). Los mismos botones (Guardar / Cómo llegar) ya
// están en los CTAs del encabezado, así que esta barra es redundante al principio:
// aparece recién cuando esos CTAs de arriba salen de pantalla al scrollear.
export function StickyActionBar({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const cta = document.querySelector('.ficha__cta')
    if (!cta) return
    const obs = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      threshold: 0,
    })
    obs.observe(cta)
    return () => obs.disconnect()
  }, [])

  return (
    <div className={`ficha__bar${visible ? ' is-visible' : ''}`}>
      <div className="ficha__bar-row">{children}</div>
    </div>
  )
}
