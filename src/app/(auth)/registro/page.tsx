import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default function RegistroPage() {
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
            Listá tu local. <em>Sin comisiones</em>, sin sorpresas.
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', color: 'var(--paper-40)', marginTop: 'var(--s-5)' }}>
            — Para negocios · Santiago 2026
          </p>
        </blockquote>

        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--tr-wide)', textTransform: 'uppercase', color: 'var(--paper-40)' }}>
          Portal Panorama · Otoño 2026
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-shell__form">
        <Link href="/" className="brand" style={{ marginBottom: 'var(--s-8)', display: 'inline-flex' }}>
          <span className="brand__mark" aria-hidden="true" />
          Portal<em>Panorama</em>
        </Link>

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
          Crear cuenta
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-8)' }}>
          Gratis. Sin tarjeta de crédito.
        </p>

        <RegisterForm />

        <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', marginTop: 'var(--s-6)' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" style={{ color: 'var(--fg)', textDecoration: 'underline' }}>
            Iniciá sesión
          </Link>
        </p>
      </div>

    </div>
  )
}
