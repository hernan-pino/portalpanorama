'use client'
import { useActionState } from 'react'
import { loginAction } from './actions'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null)

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
        <label
          htmlFor="email"
          style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}
        >
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <label
          htmlFor="password"
          style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn--primary"
        style={{ width: '100%', marginTop: 'var(--s-2)', justifyContent: 'center' }}
      >
        {pending ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}
