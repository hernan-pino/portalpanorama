export function TabListas() {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>Mis listas</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Colecciones privadas de lugares.
        </p>
      </div>

      <div style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--surface-line)',
        borderRadius: 'var(--r-lg)',
        padding: 'var(--s-8)',
        textAlign: 'center',
        color: 'var(--fg-muted)',
        fontSize: 'var(--t-body-sm)',
      }}>
        Las listas personalizadas estarán disponibles próximamente.
      </div>
    </div>
  )
}
