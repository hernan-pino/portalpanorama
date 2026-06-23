import type { Metadata } from 'next'
import Link from 'next/link'
import { googleAuthEnabled } from '@lib/auth'
import { GoogleButton } from '../GoogleButton'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; registered?: string }>
}) {
  const { reset, registered } = await searchParams
  const notice = reset
    ? 'Tu contraseña se actualizó. Ya podés iniciar sesión.'
    : registered
      ? 'Tu cuenta se creó. Iniciá sesión para continuar.'
      : null

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
          <span className="auth-tabs__item auth-tabs__item--active">Iniciar sesión</span>
          <Link href="/registro" className="auth-tabs__item">Registrarse</Link>
        </div>

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
          Bienvenido de vuelta
        </h1>

        {notice && (
          <p
            role="status"
            style={{
              fontSize: 'var(--t-body-sm)',
              padding: 'var(--s-3) var(--s-4)',
              background: 'color-mix(in oklab, var(--accent) 10%, transparent)',
              borderRadius: 'var(--r-md)',
              marginBottom: 'var(--s-6)',
            }}
          >
            {notice}
          </p>
        )}

        <LoginForm />
        {googleAuthEnabled && <GoogleButton />}
      </div>

    </div>
  )
}
