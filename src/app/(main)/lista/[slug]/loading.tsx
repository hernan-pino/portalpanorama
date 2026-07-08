// Skeleton de la guía: encabezado + filas editoriales de destacados, con las
// mismas proporciones del layout real para que el contenido no salte al llegar.
export default function LoadingLista() {
  return (
    <div className="curated-page" aria-busy="true" aria-label="Cargando guía">
      <header className="curated-page__head">
        <div className="skel" style={{ width: 60, height: 14 }} />
        <div className="skel" style={{ maxWidth: 540, height: 42, marginTop: 'var(--s-3)' }} />
        <div className="skel" style={{ maxWidth: 640, height: 16, marginTop: 'var(--s-3)' }} />
        <div className="skel" style={{ width: 90, height: 14, marginTop: 'var(--s-3)' }} />
      </header>

      <section className="curated-page__section">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--s-5)', marginBottom: 'var(--s-8)', flexWrap: 'wrap' }}>
            <div className="skel" style={{ width: 320, maxWidth: '100%', aspectRatio: '4 / 3', flexShrink: 0 }} />
            <div style={{ flex: '1 1 280px', minWidth: 0 }}>
              <div className="skel" style={{ maxWidth: 320, height: 26 }} />
              <div className="skel" style={{ maxWidth: 240, height: 14, marginTop: 'var(--s-3)' }} />
              <div className="skel" style={{ height: 14, marginTop: 'var(--s-4)' }} />
              <div className="skel" style={{ height: 14, marginTop: 'var(--s-2)' }} />
              <div className="skel" style={{ maxWidth: '70%', height: 14, marginTop: 'var(--s-2)' }} />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
