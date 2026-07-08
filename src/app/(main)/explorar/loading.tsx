// Skeleton de explorar: encabezado + franja de categorías + grilla de tarjetas
// (reusa .results-grid para que las columnas calcen con la página real).
export default function LoadingExplorar() {
  return (
    <div className="explorar" aria-busy="true" aria-label="Cargando lugares">
      <div className="explorar__head container">
        <div className="skel" style={{ width: 140, height: 14 }} />
        <div className="skel" style={{ maxWidth: 380, height: 36, marginTop: 'var(--s-3)' }} />
        <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-5)', flexWrap: 'wrap' }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skel" style={{ width: 110, height: 34, borderRadius: 'var(--r-pill)' }} />
          ))}
        </div>
      </div>

      <div className="explorar__shell container">
        <div className="explorar__main" style={{ width: '100%' }}>
          <div className="skel" style={{ width: 180, height: 16, marginBlock: 'var(--s-4)' }} />
          <div className="results-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i}>
                <div className="skel" style={{ aspectRatio: '4 / 3' }} />
                <div className="skel" style={{ maxWidth: '80%', height: 16, marginTop: 'var(--s-3)' }} />
                <div className="skel" style={{ maxWidth: '55%', height: 13, marginTop: 'var(--s-2)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
