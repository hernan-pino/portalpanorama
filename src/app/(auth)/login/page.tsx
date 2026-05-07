import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--s-6)',
        background: 'var(--bg-sunken)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-raised)',
          border: '1px solid var(--surface-line)',
          borderRadius: 'var(--r-xl)',
          padding: 'var(--s-10) var(--s-8)',
          boxShadow: 'var(--shadow-3)',
        }}
      >
        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--s-8)' }}>
          <Link href="/" className="brand" style={{ justifyContent: 'center' }}>
            <span className="brand__mark" aria-hidden="true" />
            Portal<em>Panorama</em>
          </Link>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--t-h2)',
            fontWeight: 400,
            letterSpacing: 'var(--tr-tight)',
            marginBottom: 'var(--s-1)',
            textAlign: 'center',
          }}
        >
          Bienvenido de vuelta
        </h1>
        <p
          style={{
            color: 'var(--fg-muted)',
            fontSize: 'var(--t-body-sm)',
            textAlign: 'center',
            marginBottom: 'var(--s-8)',
          }}
        >
          Ingresá con tu cuenta de Portal Panorama
        </p>

        <LoginForm />

        <p
          style={{
            textAlign: 'center',
            fontSize: 'var(--t-body-sm)',
            color: 'var(--fg-muted)',
            marginTop: 'var(--s-6)',
          }}
        >
          ¿No tenés cuenta?{' '}
          <Link
            href="/registro"
            style={{ color: 'var(--fg)', textDecoration: 'underline' }}
          >
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  )
}
