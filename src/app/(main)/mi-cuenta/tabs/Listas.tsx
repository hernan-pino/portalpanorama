export function TabListas() {
  const MOCK_LISTS = [
    {
      id: '1',
      name: 'Por visitar',
      description: 'Palermo · Privada',
      count: 2,
      items: ['Ambrosía Bistró', 'Liquiche'],
    },
    {
      id: '2',
      name: 'Mejores restaurantes',
      description: 'Lunes · Privada',
      count: 4,
      items: ['Salvador Cocina y Café', 'Liquiche'],
    },
    {
      id: '3',
      name: 'Plan en pareja',
      description: 'Vista: Orellana · Patio: Exterior',
      count: 2,
      items: ['Rooftop Sens', 'Nadia'],
    },
  ]

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)' }}>
          Mis <em>listas</em>
        </h1>
        <button className="btn btn--primary btn--sm" disabled title="Próximamente">
          + Nueva lista
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--s-5)',
        }}
      >
        {MOCK_LISTS.map((list) => (
          <div
            key={list.id}
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--surface-line)',
              borderRadius: 'var(--r-lg)',
              padding: 'var(--s-5)',
            }}
          >
            <div style={{ marginBottom: 'var(--s-4)' }}>
              <p
                className="display"
                style={{ fontSize: 'var(--t-h4)', fontStyle: 'italic', marginBottom: 'var(--s-1)' }}
              >
                {list.name}
              </p>
              <p style={{ fontSize: 'var(--t-mono-sm)', fontFamily: 'var(--font-mono)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', color: 'var(--fg-subtle)' }}>
                {list.count} lugares · {list.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)', marginBottom: 'var(--s-4)' }}>
              {list.items.map((item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--s-2) 0',
                    borderBottom: '1px solid var(--surface-line)',
                  }}
                >
                  <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-default)' }}>{item}</p>
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--fg-subtle)', cursor: 'pointer', fontSize: 'var(--t-body-sm)' }}
                    disabled
                    title="Próximamente"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button
              style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              disabled
              title="Próximamente"
            >
              + Agregar lugar
            </button>
          </div>
        ))}

        {/* Nueva lista card */}
        <div
          style={{
            border: '1px dashed var(--surface-line)',
            borderRadius: 'var(--r-lg)',
            padding: 'var(--s-5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 160,
            gap: 'var(--s-3)',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid var(--surface-line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--fg-muted)',
              fontSize: 'var(--t-h4)',
            }}
          >
            +
          </div>
          <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>Nueva lista</p>
        </div>
      </div>

      <p style={{ marginTop: 'var(--s-6)', fontSize: 'var(--t-body-sm)', color: 'var(--fg-subtle)', fontStyle: 'italic' }}>
        La gestión de listas estará disponible próximamente.
      </p>
    </div>
  )
}
