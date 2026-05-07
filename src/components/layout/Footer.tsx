import Link from 'next/link'

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--surface-line)',
        background: 'var(--bg-sunken)',
        marginTop: 'auto',
      }}
    >
      <div className="container" style={{ padding: 'var(--s-10) var(--content-pad)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--s-8)',
          }}
        >
          {/* Brand */}
          <div>
            <p
              className="brand"
              style={{ marginBottom: 'var(--s-3)', fontSize: '18px' }}
            >
              <span className="brand__mark" aria-hidden="true" />
              Portal<em>Panorama</em>
            </p>
            <p
              style={{
                fontSize: 'var(--t-body-sm)',
                color: 'var(--fg-muted)',
                lineHeight: 'var(--lh-loose)',
              }}
            >
              Directorio de negocios
              <br />
              Santiago, Chile
            </p>
          </div>

          {/* Explorar */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>
              Explorar
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              <FooterLink href="/explorar">Todos los lugares</FooterLink>
              <FooterLink href="/explorar?barrio=lastarria">Lastarria</FooterLink>
              <FooterLink href="/explorar?barrio=bellavista">Bellavista</FooterLink>
              <FooterLink href="/explorar?barrio=providencia">Providencia</FooterLink>
            </nav>
          </div>

          {/* Negocios */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>
              Negocios
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              <FooterLink href="/planes">Planes y precios</FooterLink>
              <FooterLink href="/dashboard">Mi dashboard</FooterLink>
              <FooterLink href="/registro">Crear cuenta</FooterLink>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <p className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>
              Legal
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              <FooterLink href="/terminos">Términos de uso</FooterLink>
              <FooterLink href="/privacidad">Privacidad</FooterLink>
            </nav>
          </div>
        </div>

        <hr className="divider-line" style={{ margin: 'var(--s-8) 0 var(--s-6)' }} />

        <p
          style={{
            fontSize: 'var(--t-body-sm)',
            color: 'var(--fg-subtle)',
            textAlign: 'center',
          }}
        >
          © {new Date().getFullYear()} Portal Panorama. Hecho en Santiago.
        </p>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      style={{
        fontSize: 'var(--t-body-sm)',
        color: 'var(--fg-muted)',
        transition: 'color var(--d-fast)',
      }}
    >
      {children}
    </Link>
  )
}
