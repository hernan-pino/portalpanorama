export function TabConfig() {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
          <em>Configuración</em>
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Ajustes de tu cuenta.
        </p>
      </div>

      <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
        <div
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--surface-line)',
            borderRadius: 'var(--r-lg)',
            padding: 'var(--s-6)',
          }}
        >
          <h2 style={{ fontSize: 'var(--t-body)', fontWeight: 500, marginBottom: 'var(--s-1)' }}>
            Cambio de contraseña
          </h2>
          <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>
            Próximamente disponible.
          </p>
        </div>

        <div
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--surface-line)',
            borderRadius: 'var(--r-lg)',
            padding: 'var(--s-6)',
          }}
        >
          <h2 style={{ fontSize: 'var(--t-body)', fontWeight: 500, marginBottom: 'var(--s-1)' }}>
            Notificaciones
          </h2>
          <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>
            Próximamente disponible.
          </p>
        </div>
      </div>
    </div>
  )
}
