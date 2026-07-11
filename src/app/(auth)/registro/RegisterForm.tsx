'use client'
import { useActionState, useState } from 'react'
import { PasswordMeter } from '../PasswordMeter'
import { registerAction } from './actions'

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(registerAction, null)
  const [password, setPassword] = useState('')

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
      {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}
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

      <FieldGroup
        id="name"
        label="Nombre"
        type="text"
        autoComplete="name"
        placeholder="Tu nombre"
        error={state?.fieldErrors?.name?.[0]}
      />
      <FieldGroup
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="tu@email.cl"
        error={state?.fieldErrors?.email?.[0]}
      />
      <FieldGroup
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres"
        error={state?.fieldErrors?.password?.[0]}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      >
        <PasswordMeter password={password} />
      </FieldGroup>

      <button
        type="submit"
        disabled={pending}
        className="btn btn--primary"
        style={{ width: '100%', marginTop: 'var(--s-2)', justifyContent: 'center' }}
      >
        {pending ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}

function FieldGroup({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  error,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  type: string
  autoComplete: string
  placeholder: string
  error?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  children?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
      <label htmlFor={id} style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        placeholder={placeholder}
        className="input"
        value={value}
        onChange={onChange}
        aria-describedby={error ? `${id}-error` : undefined}
        style={error ? { borderColor: 'var(--error)' } : undefined}
      />
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}
