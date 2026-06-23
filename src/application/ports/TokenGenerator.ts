// Genera tokens opacos de un solo uso (recuperar contraseña) y su hash.
// El token en claro viaja solo en el email; en la BD se guarda el hash.
export interface TokenGenerator {
  /** Token aleatorio en claro (suficiente entropía para que no se adivine). */
  generate(): string
  /** Hash determinista del token, para buscar/guardar sin exponer el original. */
  hash(rawToken: string): string
}
