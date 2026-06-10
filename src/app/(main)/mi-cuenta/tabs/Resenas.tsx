import Link from 'next/link'

// Las reseñas propias son v2 (decisión B.7/C.1): la sección existe vacía en el MVP.
export function TabResenas() {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
          Mis <em>reseñas</em>
        </h1>
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--s-16) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-4)' }}>
        <p className="display" style={{ fontSize: 'var(--t-h2)', color: 'var(--fg-muted)' }}>
          Próximamente
        </p>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', maxWidth: 320 }}>
          Pronto vas a poder escribir reseñas de los lugares que visitas.
        </p>
        <Link href="/explorar" className="btn btn--ghost">
          Explorar →
        </Link>
      </div>
    </div>
  )
}
