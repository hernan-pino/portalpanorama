'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { requestPasswordResetAction } from './actions'

export function RequestResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, null)

  if (state?.done) {
    return (
      <div
        role="status"
        style={{
          fontSize: 'var(--t-body-sm)',
          padding: 'var(--s-4)',
          background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
          borderRadius: 'var(--r-md)',
          color: 'var(--fg-default)',
        }}
      >
        <p style={{ marginBottom: 'var(--s-2)' }}>
          Si hay una cuenta asociada a ese email, te enviamos un enlace para restablecer tu
          contraseña. Revisá tu correo (y la carpeta de spam).
        </p>
        <Link href="/login" className="link">
          Volver a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
      {state?.error && (
        <p
          role="alert"
          style={{
            color: 'var(--error)',
            fontSize: 'var(--t-body-sm)',
            padding: 'var(--s-3) var(--s-4)',
            background: 'color-mix(in oklab, var(--error) 8%, transparent)',
            borderRadius: 'var(--r-md)',
          }}
        >
          {state.error}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <label htmlFor="email" style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.cl"
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn--primary"
        style={{ width: '100%', marginTop: 'var(--s-2)', justifyContent: 'center' }}
      >
        {pending ? 'Enviando…' : 'Enviar enlace de recuperación'}
      </button>

      <Link href="/login" className="link" style={{ fontSize: 'var(--t-body-sm)', textAlign: 'center' }}>
        Volver a iniciar sesión
      </Link>
    </form>
  )
}
