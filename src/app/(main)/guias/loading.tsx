// Skeleton del índice de guías: encabezado + grilla de tarjetas (reusa
// .home-guides__grid para que las columnas calcen con la página real).
export default function LoadingGuias() {
  return (
    <div className="container" style={{ paddingBlock: 'var(--s-10)' }} aria-busy="true" aria-label="Cargando guías">
      <header style={{ marginBottom: 'var(--s-8)' }}>
        <div className="skel" style={{ width: 60, height: 14 }} />
        <div className="skel" style={{ maxWidth: 520, height: 40, marginTop: 'var(--s-3)' }} />
        <div className="skel" style={{ maxWidth: 620, height: 16, marginTop: 'var(--s-3)' }} />
      </header>
      <div className="home-guides__grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i}>
            <div className="skel" style={{ aspectRatio: '16 / 10' }} />
            <div className="skel" style={{ maxWidth: '75%', height: 18, marginTop: 'var(--s-3)' }} />
            <div className="skel" style={{ maxWidth: '50%', height: 13, marginTop: 'var(--s-2)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
