'use client'
import { useState, useTransition } from 'react'
import { registerInlineAction, loginInlineAction } from './auth-actions'

// Paso 1 del wizard: la cuenta. Vive DENTRO de la página (no manda a /registro) para
// no cortar el flujo. Google sí sale del sitio por definición del protocolo OAuth,
// pero vuelve a esta misma ruta y el wizard reabre en el paso 2.
export function AccountStep({
  googleEnabled,
  googleButton,
  onDone,
}: {
  googleEnabled: boolean
  /** El botón de Google se arma en el server (es un form con server action). */
  googleButton: React.ReactNode
  onDone: () => void
}) {
  const [mode, setMode] = useState<'register' | 'login'>('register')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const action = mode === 'register' ? registerInlineAction : loginInlineAction
      const res = await action(formData)
      if ('error' in res) {
        setError(res.error)
        return
      }
      onDone()
    })
  }

  return (
    <div className="wizard-panel">
      <h2 className="wizard-panel__title">
        {mode === 'register' ? 'Crea tu cuenta' : 'Inicia sesión'}
      </h2>
      <p className="wizard-panel__sub">
        {mode === 'register'
          ? 'Gratis, sin tarjeta. Con ella gestionas tu negocio: es el mismo panel donde después editas tu ficha.'
          : 'Entra con tu cuenta y sigue con los datos de tu negocio.'}
      </p>

      {googleEnabled && googleButton}

      <form onSubmit={handleSubmit} className="wizard-form">
        {mode === 'register' && (
          <div>
            <label className="form-label" htmlFor="acc-name">Nombre</label>
            <input id="acc-name" name="name" className="form-input" required autoComplete="name" placeholder="Tu nombre" />
          </div>
        )}

        <div>
          <label className="form-label" htmlFor="acc-email">Email</label>
          <input id="acc-email" name="email" type="email" className="form-input" required autoComplete="email" placeholder="tu@email.cl" />
        </div>

        <div>
          <label className="form-label" htmlFor="acc-password">Contraseña</label>
          <input
            id="acc-password"
            name="password"
            type="password"
            className="form-input"
            required
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
          />
        </div>

        {error && <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', margin: 0 }}>{error}</p>}

        <button
          type="submit"
          className={`btn ${googleEnabled ? 'btn--ghost' : 'btn--primary'}`}
          disabled={isPending}
          style={{ justifyContent: 'center' }}
        >
          {isPending
            ? 'Un momento…'
            : mode === 'register'
              ? 'Crear cuenta y continuar'
              : 'Entrar y continuar'}
        </button>
      </form>

      <p className="wizard-panel__foot">
        {mode === 'register' ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}{' '}
        <button
          type="button"
          className="wizard-panel__switch"
          onClick={() => {
            setMode(mode === 'register' ? 'login' : 'register')
            setError(null)
          }}
        >
          {mode === 'register' ? 'Inicia sesión' : 'Créala aquí'}
        </button>
      </p>
    </div>
  )
}
