'use client'
import { useEffect } from 'react'

// Aviso efímero de confirmación ("Se agregó a Favoritos"). Se autodescarta;
// el dueño limpia su estado en onDone. Uno a la vez por componente dueño.
export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [onDone, message])
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  )
}
