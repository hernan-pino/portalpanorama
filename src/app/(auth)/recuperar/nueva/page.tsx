import type { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from './ResetPasswordForm'

export const metadata: Metadata = { title: 'Nueva contraseña' }

export default async function NuevaPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <div className="auth-shell">
      <div className="auth-shell__art">
        <Link href="/" className="brand" style={{ color: 'var(--paper-05)' }}>
          <span className="brand__mark" aria-hidden="true" />
          Portal<em>Panorama</em>
        </Link>
        <blockquote style={{ margin: 0 }}>
          <h2>
            Elige una contraseña <em>nueva</em>.
          </h2>
        </blockquote>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', letterSpacing: 'var(--tr-wide)', textTransform: 'uppercase', color: 'var(--ink-inverse-muted)' }}>
          Portal Panorama · Otoño 2026
        </p>
      </div>

      <div className="auth-shell__form">
        <Link href="/" className="brand" style={{ marginBottom: 'var(--s-8)', display: 'inline-flex' }}>
          <span className="brand__mark" aria-hidden="true" />
          Portal<em>Panorama</em>
        </Link>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(30px, 8vw, 40px)',
            fontWeight: 400,
            letterSpacing: 'var(--tr-tight)',
            lineHeight: 1,
            marginBottom: 'var(--s-2)',
            fontVariationSettings: '"opsz" 100',
          }}
        >
          Nueva contraseña
        </h1>

        {token ? (
          <>
            <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-8)' }}>
              Crea tu nueva contraseña para volver a entrar.
            </p>
            <ResetPasswordForm token={token} />
          </>
        ) : (
          <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginTop: 'var(--s-6)' }}>
            El enlace está incompleto o es inválido.{' '}
            <Link href="/recuperar" className="link">
              Pide uno nuevo
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
