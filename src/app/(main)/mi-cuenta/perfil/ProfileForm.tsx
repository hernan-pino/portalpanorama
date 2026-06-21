'use client'
import { useState, useTransition } from 'react'
import { updateProfileAction } from './actions'

interface ProfileFormProps {
  name: string
  email: string
}

export function ProfileForm({ name, email }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setStatus(null)
    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result && 'error' in result) {
        setStatus({ error: result.error })
      } else {
        setStatus({ success: true })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)', maxWidth: 480 }}>
      {/* Nombre */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <label htmlFor="name" style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>
          Nombre
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={name}
          style={{
            padding: 'var(--s-3) var(--s-4)',
            border: '1px solid var(--surface-line)',
            borderRadius: 'var(--r-md)',
            fontSize: 'var(--t-body)',
            background: 'var(--bg-raised)',
            color: 'var(--ink-100)',
          }}
        />
      </div>

      {/* Email (solo lectura) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <label style={{ fontSize: 'var(--t-body-sm)', fontWeight: 500 }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          readOnly
          style={{
            padding: 'var(--s-3) var(--s-4)',
            border: '1px solid var(--surface-line)',
            borderRadius: 'var(--r-md)',
            fontSize: 'var(--t-body)',
            background: 'var(--bg-sunken)',
            color: 'var(--fg-muted)',
            cursor: 'not-allowed',
          }}
        />
        <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-subtle)' }}>
          El email no se puede cambiar desde acá.
        </p>
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
          Perfil actualizado correctamente.
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="btn btn--primary"
        >
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
