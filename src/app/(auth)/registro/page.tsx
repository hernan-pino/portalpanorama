import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './RegisterForm'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default function RegistroPage() {
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
          Crear cuenta
        </h1>
        <p
          style={{
            color: 'var(--fg-muted)',
            fontSize: 'var(--t-body-sm)',
            textAlign: 'center',
            marginBottom: 'var(--s-8)',
          }}
        >
          Gratis. Sin tarjeta de crédito.
        </p>

        <RegisterForm />

        <p
          style={{
            textAlign: 'center',
            fontSize: 'var(--t-body-sm)',
            color: 'var(--fg-muted)',
            marginTop: 'var(--s-6)',
          }}
        >
          ¿Ya tenés cuenta?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--fg)', textDecoration: 'underline' }}
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
