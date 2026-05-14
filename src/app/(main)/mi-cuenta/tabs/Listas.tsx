import Link from 'next/link'

export function TabListas() {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
        Mis <em>listas</em>
      </h1>
      <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-10)' }}>
        Crea colecciones de lugares para organizar tus favoritos.
      </p>

      <div style={{ textAlign: 'center', padding: 'var(--s-16) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--s-4)' }}>
        <p className="display" style={{ fontSize: 'var(--t-h2)', color: 'var(--fg-muted)' }}>
          Próximamente
        </p>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', maxWidth: 320, textAlign: 'center' }}>
          Las listas personalizadas estarán disponibles pronto.
        </p>
        <Link href="/explorar" className="btn btn--ghost">
          Explorar →
        </Link>
      </div>
    </div>
  )
}
