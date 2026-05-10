import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
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

      {/* ── DEV credentials (borrar antes de deploy) ── */}
      <div style={{
        position: 'fixed', bottom: 'var(--s-4)', right: 'var(--s-4)',
        background: 'var(--bg-raised)', border: '1px solid var(--surface-line)',
        borderRadius: 'var(--r-lg)', padding: 'var(--s-4) var(--s-5)',
        fontSize: 'var(--t-body-sm)', zIndex: 9999,
        boxShadow: '0 4px 16px rgba(0,0,0,.12)',
      }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', color: 'var(--fg-subtle)', marginBottom: 'var(--s-3)' }}>
          Dev — credenciales
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
          <CredRow label="Admin" email="admin@portalpanorama.cl" pass="admin1234" />
          <CredRow label="Negocio" email="negocio@portalpanorama.cl" pass="negocio1234" />
          <CredRow label="Usuario" email="usuario@portalpanorama.cl" pass="usuario1234" />
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-shell__form">
        <Link href="/" className="brand" style={{ marginBottom: 'var(--s-8)', display: 'inline-flex' }}>
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
            fontSize: '40px',
            fontWeight: 400,
            letterSpacing: 'var(--tr-tight)',
            lineHeight: 1,
            marginBottom: 'var(--s-2)',
            fontVariationSettings: '"opsz" 100',
          }}
        >
          Bienvenido de vuelta
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-8)' }}>
          Ingresá con tu cuenta de Portal Panorama
        </p>

        <LoginForm />
      </div>

    </div>
  )
}

function CredRow({ label, email, pass }: { label: string; email: string; pass: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--s-3)', alignItems: 'baseline' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', color: 'var(--fg-subtle)', minWidth: 48 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', userSelect: 'all' }}>{email}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', color: 'var(--fg-muted)', userSelect: 'all' }}>{pass}</span>
    </div>
  )
}
