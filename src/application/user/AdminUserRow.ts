import { UserRole } from '@domain/user/UserRole'

// Cómo inició sesión el usuario (para que el admin sepa si tiene contraseña local
// o entró con Google). 'both' = tiene ambas; 'none' = caso raro sin método.
export type UserAuthMethod = 'password' | 'oauth' | 'both' | 'none'

// Read-model de la tabla de admin de usuarios. No es el agregado User: trae
// métricas calculadas (método de login, lugares guardados) que la lista necesita.
export interface AdminUserRow {
  id: string
  email: string
  name: string
  role: UserRole
  authMethod: UserAuthMethod
  savedCount: number
  createdAt: Date
}
