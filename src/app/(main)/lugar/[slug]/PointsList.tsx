'use client'
import { useState } from 'react'

// Lista de spots sin ficha ("Qué hay en …"). Colapsada por defecto a unos pocos
// con un toggle "Ver más", para que un contenedor con muchos puntos (ej. Parquemet)
// no abrume visualmente. Cliente por el estado de expandido.
const COLLAPSED_COUNT = 3

interface Point {
  name: string
  description?: string | null
}

export function PointsList({ points }: { points: Point[] }) {
  const [expanded, setExpanded] = useState(false)
  const hidden = points.length - COLLAPSED_COUNT
  const visible = expanded ? points : points.slice(0, COLLAPSED_COUNT)

  return (
    <>
      <ul className="ficha__points">
        {visible.map((pt, i) => (
          <li key={i} className="ficha__point">
            <span className="ficha__point-name">{pt.name}</span>
            {pt.description && <span className="ficha__point-desc">{pt.description}</span>}
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          className="ficha__points-toggle"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          {expanded ? 'Ver menos' : `Ver ${hidden} más`}
        </button>
      )}
    </>
  )
}
