import { signInWithGoogle } from './oauth-actions'

// Botón "Continuar con Google". Se renderiza solo cuando el provider está habilitado
// (ver googleAuthEnabled en lib/auth). Es un form con server action para mantener el
// flujo de OAuth del lado servidor. Es el método PREFERIDO: va primero y en estilo
// primario; `divider` controla si la línea "o" va debajo (Google arriba) o encima.
export function GoogleButton({
  label = 'Continuar con Google',
  divider = 'below',
  redirectTo,
}: {
  label?: string
  divider?: 'above' | 'below'
  /** Dónde aterrizar al volver de Google (por defecto /explorar). */
  redirectTo?: string
}) {
  const separator = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--s-3)',
        margin: 'var(--s-5) 0',
        color: 'var(--fg-subtle)',
        fontSize: 'var(--t-body-sm)',
      }}
    >
      <span style={{ flex: 1, height: 1, background: 'var(--surface-line)' }} />
      o
      <span style={{ flex: 1, height: 1, background: 'var(--surface-line)' }} />
    </div>
  )
  return (
    <>
      {divider === 'above' && separator}
      <form action={signInWithGoogle}>
        {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
        <button
          type="submit"
          className="btn btn--primary"
          style={{ width: '100%', justifyContent: 'center', gap: 'var(--s-2)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.94H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.06l3.01-2.34z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
          </svg>
          {label}
        </button>
      </form>
      {divider === 'below' && separator}
    </>
  )
}
