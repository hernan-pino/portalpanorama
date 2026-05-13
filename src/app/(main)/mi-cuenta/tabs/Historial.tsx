import Link from 'next/link'

export function TabHistorial() {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
          Lugares <em>visitados</em>
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Los lugares que viste recientemente.
        </p>
      </div>

      <div
        style={{
          border: '1px dashed var(--surface-line)',
          borderRadius: 'var(--r-lg)',
          padding: 'var(--s-10)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--s-3)',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Próximamente
        </p>
        <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', maxWidth: 280 }}>
          Tu historial de lugares visitados aparecerá acá.
        </p>
        <Link href="/explorar" className="btn btn--ghost" style={{ marginTop: 'var(--s-2)' }}>
          Explorar →
        </Link>
      </div>
    </div>
  )
}
