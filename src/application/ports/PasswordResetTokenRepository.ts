export interface PasswordResetTokenRecord {
  userId: string
  tokenHash: string
  expiresAt: Date
}

export interface PasswordResetTokenRepository {
  create(token: PasswordResetTokenRecord): Promise<void>
  /** Devuelve el userId si el token existe, no está usado y no expiró; si no, null. */
  findValidUserId(tokenHash: string): Promise<string | null>
  markUsed(tokenHash: string): Promise<void>
  /** Invalida los tokens previos del usuario (un pedido nuevo descarta los anteriores). */
  deleteAllForUser(userId: string): Promise<void>
}
