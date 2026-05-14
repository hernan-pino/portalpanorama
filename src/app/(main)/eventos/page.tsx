import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Eventos — Portal Panorama' }

export default function EventosPage() {
  return (
    <div className="container page-enter" style={{ paddingTop: 'var(--s-24)', paddingBottom: 'var(--s-24)', textAlign: 'center' }}>
      <p
        className="eyebrow"
        style={{ marginBottom: 'var(--s-6)', fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', color: 'var(--fg-muted)' }}
      >
        Próximamente
      </p>
      <h1 className="display" style={{ fontSize: 'clamp(var(--t-h2), 5vw, var(--t-h1))', marginBottom: 'var(--s-4)' }}>
        <em>Eventos</em> en Santiago
      </h1>
      <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body)', maxWidth: 460, margin: '0 auto var(--s-8)', lineHeight: 'var(--lh-loose)' }}>
        Estamos preparando la agenda cultural de Santiago. Mientras tanto, explora los mejores lugares.
      </p>
      <Link href="/explorar" className="btn btn--primary">
        Explorar lugares
      </Link>
    </div>
  )
}
