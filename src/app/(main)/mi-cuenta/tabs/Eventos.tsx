import Link from 'next/link'

export function TabEventos() {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
          Mis <em>eventos</em>
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Eventos que guardaste para ir.
        </p>
      </div>

      <div style={{ textAlign: 'center', padding: 'var(--s-16) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-4)' }}>
        <p className="display" style={{ fontSize: 'var(--t-h2)', color: 'var(--fg-muted)' }}>
          Próximamente
        </p>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', maxWidth: 320, textAlign: 'center' }}>
          Los eventos guardados aparecerán acá cuando esté disponible.
        </p>
        <Link href="/explorar" className="btn btn--ghost">
          Explorar →
        </Link>
      </div>
    </div>
  )
}
