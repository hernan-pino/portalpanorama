'use client'
import { useState } from 'react'

// Ayuda por campo: un "?" clickeable junto a la etiqueta que muestra recomendaciones
// / mejores prácticas. Reutilizable en el editor del panel y en el form de reclamo.
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
      >
        ?
      </button>
      {open && <span className="field-help__tip" role="note">{tip}</span>}
    </span>
  )
}
