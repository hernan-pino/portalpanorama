export function TabEventos() {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>Eventos</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Publicá y gestioná eventos de tu negocio.
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
        La gestión de eventos estará disponible próximamente.
      </div>
    </div>
  )
}
