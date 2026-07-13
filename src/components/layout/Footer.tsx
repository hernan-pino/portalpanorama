import Link from 'next/link'
import { auth } from '@lib/auth'
import { SuggestionWidget } from './SuggestionWidget'
import { FooterSocial } from './FooterSocial'

export async function Footer() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand-col">
            <p className="footer__brand-display">Portal Panorama</p>
            <p className="footer__tagline">La guía editorial de Santiago, Chile.</p>
            <FooterSocial />
          </div>

          <div className="footer__links">
            <div>
              <h4>Explorar</h4>
              <ul>
                <li><Link href="/explorar">Todos los lugares</Link></li>
                <li><Link href="/explorar?comuna=providencia">Providencia</Link></li>
                <li><Link href="/explorar?barrio=barrio-lastarria">Lastarria</Link></li>
                <li><Link href="/explorar?barrio=bellavista">Bellavista</Link></li>
              </ul>
            </div>
            <div>
              <h4>Tu cuenta</h4>
              {/* Ofrecer "Mis listas" a quien no tiene sesión lo mandaba al login sin
                  contexto; y a quien ya entró, "Crear cuenta" no le dice nada. */}
              <ul>
                {isLoggedIn ? (
                  <li><Link href="/mi-cuenta">Mis listas</Link></li>
                ) : (
                  <>
                    <li><Link href="/registro">Crear cuenta</Link></li>
                    <li><Link href="/login">Iniciar sesión</Link></li>
                  </>
                )}
                <li><Link href="/para-negocios">Para negocios</Link></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><Link href="/terminos">Términos de uso</Link></li>
                <li><Link href="/privacidad">Privacidad</Link></li>
                <li><Link href="/como-ordenamos">Cómo ordenamos</Link></li>
              </ul>
            </div>
          </div>

          <SuggestionWidget />
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Portal Panorama</span>
          <span>Hecho en Santiago 🇨🇱</span>
        </div>
      </div>
    </footer>
  )
}
