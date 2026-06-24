'use client'
import { useState, useTransition } from 'react'
import { PasswordMeter } from '@/app/(auth)/PasswordMeter'
import { changePasswordAction } from './actions'

const fieldStyle: React.CSSProperties = {
  padding: 'var(--s-3) var(--s-4)',
  border: '1px solid var(--surface-line)',
  borderRadius: 'var(--r-md)',
  fontSize: 'var(--t-body)',
  background: 'var(--bg-raised)',
  color: 'var(--ink-100)',
}

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null)
  const [newPassword, setNewPassword] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    setStatus(null)
    startTransition(async () => {
      const result = await changePasswordAction(formData)
      if (result && 'error' in result) {
        setStatus({ error: result.error })
      } else {
        setStatus({ success: true })
        form.reset()
        setNewPassword('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)', maxWidth: 480 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <label htmlFor="currentPassword" style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>
          Contraseña actual
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          style={fieldStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <label htmlFor="newPassword" style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>
          Nueva contraseña
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={fieldStyle}
        />
        <PasswordMeter password={newPassword} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <label htmlFor="confirmPassword" style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>
          Repetir nueva contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          style={fieldStyle}
        />
      </div>

      {status?.error && (
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
          {status.error}
        </p>
      )}

      {status?.success && (
        <p
          role="status"
          style={{
            color: 'var(--success)',
            fontSize: 'var(--t-body-sm)',
            padding: 'var(--s-3) var(--s-4)',
            background: 'color-mix(in oklab, var(--success) 8%, transparent)',
            borderRadius: 'var(--r-md)',
          }}
        >
          Contraseña actualizada correctamente.
        </p>
      )}

      <div>
        <button type="submit" disabled={isPending} className="btn btn--primary">
          {isPending ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </div>
    </form>
  )
}
