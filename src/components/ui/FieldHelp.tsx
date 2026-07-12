'use client'
import { useState } from 'react'

// Ayuda por campo: un "?" junto a la etiqueta que muestra recomendaciones / mejores
// prácticas en una burbuja flotante (no empuja el layout). Aparece al pasar el mouse
// y también con click/foco (para touch y teclado). Reutilizable en el editor y el reclamo.
export function FieldHelp({ tip }: { tip: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="field-help">
      <button
        type="button"
        className="field-help__btn"
        aria-expanded={open}
        aria-label="Ver recomendación"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      <span className={`field-help__tip${open ? ' is-open' : ''}`} role="tooltip">{tip}</span>
    </span>
  )
}
