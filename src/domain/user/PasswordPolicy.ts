// Política de contraseña — regla pura, sin dependencias de framework.
// La comparten la validación del registro (server) y el medidor visual (cliente),
// así el criterio de "fuerza" vive en un solo lugar.

export type PasswordScore = 0 | 1 | 2 | 3 | 4

export interface PasswordStrength {
  /** 0 (vacía/muy débil) … 4 (muy fuerte) — para pintar el medidor. */
  readonly score: PasswordScore
  /** Etiqueta legible del nivel. */
  readonly label: string
  /** Requisitos mínimos que aún NO cumple (vacío ⇒ se puede registrar). */
  readonly issues: string[]
  /** true cuando cumple el mínimo aceptable para crear la cuenta. */
  readonly acceptable: boolean
}

const MIN_LENGTH = 8

const LABELS: Record<PasswordScore, string> = {
  0: 'Muy débil',
  1: 'Débil',
  2: 'Aceptable',
  3: 'Fuerte',
  4: 'Muy fuerte',
}

/**
 * Evalúa una contraseña. El mínimo para registrar (`acceptable`) es:
 * ≥8 caracteres, al menos una letra y al menos un número. El `score` premia
 * además longitud, mayúsculas+minúsculas y símbolos para guiar al usuario.
 */
export function evaluatePassword(password: string): PasswordStrength {
  const issues: string[] = []

  if (password.length < MIN_LENGTH) issues.push(`Al menos ${MIN_LENGTH} caracteres`)
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  if (!hasLetter) issues.push('Al menos una letra')
  if (!hasNumber) issues.push('Al menos un número')

  const acceptable = issues.length === 0

  // Puntaje 0-4 a partir de criterios acumulativos.
  let points = 0
  if (password.length >= MIN_LENGTH) points++
  if (password.length >= 12) points++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++
  if (hasNumber) points++
  if (/[^a-zA-Z0-9]/.test(password)) points++

  // Una contraseña que no llega al mínimo nunca pasa de "Débil".
  let score = Math.min(points, 4) as PasswordScore
  if (!acceptable) score = Math.min(score, 1) as PasswordScore
  if (password.length === 0) score = 0

  return { score, label: LABELS[score], issues, acceptable }
}
