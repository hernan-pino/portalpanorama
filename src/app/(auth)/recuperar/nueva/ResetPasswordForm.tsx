'use client'
import { useActionState, useState } from 'react'
import { PasswordMeter } from '../../PasswordMeter'
import { resetPasswordAction } from './actions'

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, null)
  const [password, setPassword] = useState('')

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
      <input type="hidden" name="token" value={token} />

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
        <label htmlFor="password" style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Mínimo 8 caracteres"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby={state?.fieldErrors?.password ? 'password-error' : undefined}
          style={state?.fieldErrors?.password ? { borderColor: 'var(--error)' } : undefined}
        />
        <PasswordMeter password={password} />
        {state?.fieldErrors?.password?.[0] && (
          <p id="password-error" role="alert" style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)' }}>
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn--primary"
        style={{ width: '100%', marginTop: 'var(--s-2)', justifyContent: 'center' }}
      >
        {pending ? 'Guardando…' : 'Guardar nueva contraseña'}
      </button>
    </form>
  )
}
