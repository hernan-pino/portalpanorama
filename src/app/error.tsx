'use client'
import Link from 'next/link'
import { useEffect } from 'react'

// Error boundary de los segmentos bajo el layout raíz. Debe ser client component.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // En producción esto iría a un servicio de logging (Sentry, etc.).
    console.error(error)
  }, [error])

  return (
    <div className="status-screen">
      <p className="eyebrow">Algo salió mal</p>
      <h1 className="display status-screen__title">Tuvimos un problema.</h1>
      <p className="status-screen__text">
        Ocurrió un error inesperado al cargar esta página. Podés reintentar; si sigue pasando,
        volvé al inicio e intentá de nuevo en un rato.
      </p>
      <div className="status-screen__actions">
        <button type="button" className="btn btn--primary" onClick={reset}>Reintentar</button>
        <Link href="/" className="btn btn--ghost">Volver al inicio</Link>
      </div>
    </div>
  )
}
