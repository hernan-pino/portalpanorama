import Link from 'next/link'

// 404 global: rutas inexistentes y todo notFound() (ej. una ficha no publicada).
export default function NotFound() {
  return (
    <div className="status-screen">
      <p className="eyebrow">Error 404</p>
      <h1 className="display status-screen__title">Esta página se nos perdió.</h1>
      <p className="status-screen__text">
        El lugar o la página que buscas no existe o cambió de dirección. Prueba volver al inicio o
        explorar los lugares de Santiago.
      </p>
      <div className="status-screen__actions">
        <Link href="/" className="btn btn--primary">Volver al inicio</Link>
        <Link href="/explorar" className="btn btn--ghost">Explorar lugares</Link>
      </div>
    </div>
  )
}
