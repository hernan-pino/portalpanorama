// Fallback de carga a nivel raíz mientras un Server Component resuelve.
export default function Loading() {
  return (
    <div className="status-screen" aria-busy="true" aria-live="polite">
      <p className="eyebrow">Cargando…</p>
      <p className="status-screen__text">Un segundo, estamos preparando esto.</p>
    </div>
  )
}
