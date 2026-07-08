// Skeleton de la ficha: replica hero + lámina (mismo alto que .ficha__hero-img)
// para que al llegar el contenido real no salte el layout.
export default function LoadingLugar() {
  return (
    <div className="ficha" aria-busy="true" aria-label="Cargando lugar">
      <div className="skel" style={{ height: 'clamp(260px, 44vw, 440px)', borderRadius: 0 }} />
      <div className="ficha__sheet">
        <div style={{ display: 'flex', gap: 'var(--s-2)', marginTop: 'var(--s-6)' }}>
          <div className="skel" style={{ width: 110, height: 26, borderRadius: 'var(--r-pill)' }} />
          <div className="skel" style={{ width: 90, height: 26, borderRadius: 'var(--r-pill)' }} />
        </div>
        <div className="skel" style={{ maxWidth: 440, height: 40, marginTop: 'var(--s-4)' }} />
        <div className="skel" style={{ maxWidth: 220, height: 16, marginTop: 'var(--s-3)' }} />
        <div className="skel" style={{ maxWidth: 260, height: 18, marginTop: 'var(--s-3)' }} />
        <div style={{ display: 'flex', gap: 'var(--s-3)', marginTop: 'var(--s-6)' }}>
          <div className="skel" style={{ width: 130, height: 44, borderRadius: 'var(--r-pill)' }} />
          <div className="skel" style={{ width: 150, height: 44, borderRadius: 'var(--r-pill)' }} />
        </div>
        <div className="skel" style={{ height: 110, marginTop: 'var(--s-8)' }} />
        <div className="skel" style={{ height: 260, marginTop: 'var(--s-6)' }} />
      </div>
    </div>
  )
}
