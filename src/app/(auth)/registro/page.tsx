import type { Metadata } from 'next'
import Link from 'next/link'
import { googleAuthEnabled } from '@lib/auth'
import { GoogleButton } from '../GoogleButton'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const { callbackUrl } = await searchParams
  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/login'
  // Viene del onboarding de negocio: la cuenta es el paso 1 de 2, no el destino.
  const fromBusiness = callbackUrl === '/mi-negocio/nuevo'
  return (
    <div className="auth-shell">

      {/* ── Art panel ── */}
      <div className="auth-shell__art">
        <Link href="/" className="brand" style={{ color: 'var(--paper-05)' }}>
          <span className="brand__mark" aria-hidden="true" />
          Portal<em>Panorama</em>
        </Link>

        <blockquote style={{ margin: 0 }}>
          <h2>
            Lo bueno de la ciudad, <em>curado</em> como revista.
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', color: 'var(--paper-40)', marginTop: 'var(--s-5)' }}>
            — Editorial · Santiago 2026
          </p>
        </blockquote>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--tr-wide)', textTransform: 'uppercase', color: 'var(--paper-40)' }}>
          Portal Panorama · Otoño 2026
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-shell__form">
        <Link href="/" className="brand" style={{ marginBottom: 'var(--s-3)', display: 'inline-flex' }}>
          <span className="brand__mark" aria-hidden="true" />
          Portal<em>Panorama</em>
        </Link>

        <div className="auth-tabs">
          <Link href={loginHref} className="auth-tabs__item">Iniciar sesión</Link>
          <span className="auth-tabs__item auth-tabs__item--active">Registrarse</span>
        </div>

        {fromBusiness && <p className="onboard-step">Paso 1 de 2 · Publica tu negocio</p>}

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(26px, 5vw, 32px)',
            fontWeight: 400,
            letterSpacing: 'var(--tr-tight)',
            lineHeight: 1,
            marginBottom: 'var(--s-2)',
            fontVariationSettings: '"opsz" 100',
          }}
        >
          {fromBusiness ? 'Crea tu cuenta de negocio' : 'Crear cuenta'}
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-4)' }}>
          {fromBusiness
            ? 'Gratis, sin tarjeta. Después te pedimos los datos de tu local y nosotros armamos su ficha.'
            : 'Gratis. Sin tarjeta de crédito.'}
        </p>

        {googleAuthEnabled && <GoogleButton label="Registrarse con Google" divider="below" />}
        <RegisterForm callbackUrl={callbackUrl} deemphasized={googleAuthEnabled} />
      </div>

    </div>
  )
}
