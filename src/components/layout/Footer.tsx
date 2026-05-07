import Link from 'next/link'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <p className="footer__brand-display">Portal<br />Panorama</p>
            <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--paper-40)', lineHeight: 'var(--lh-loose)', marginTop: 'var(--s-5)' }}>
              La guía editorial de<br />Santiago, Chile.
            </p>
          </div>

          <div>
            <h4>Explorar</h4>
            <ul>
              <li><Link href="/explorar">Todos los lugares</Link></li>
              <li><Link href="/explorar?barrio=Lastarria">Lastarria</Link></li>
              <li><Link href="/explorar?barrio=Bellavista">Bellavista</Link></li>
              <li><Link href="/explorar?barrio=Providencia">Providencia</Link></li>
              <li><Link href="/explorar?barrio=Italia">Italia</Link></li>
            </ul>
          </div>

          <div>
            <h4>Negocios</h4>
            <ul>
              <li><Link href="/planes">Planes y precios</Link></li>
              <li><Link href="/dashboard">Mi dashboard</Link></li>
              <li><Link href="/registro">Crear cuenta</Link></li>
            </ul>
          </div>

          <div>
            <h4>Legal</h4>
            <ul>
              <li><Link href="/terminos">Términos de uso</Link></li>
              <li><Link href="/privacidad">Privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Portal Panorama</span>
          <span>Hecho en Santiago</span>
        </div>
      </div>
    </footer>
  )
}
