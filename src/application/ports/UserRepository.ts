import { User } from '@domain/user/User'
import { UserRole } from '@domain/user/UserRole'
import { AdminUserRow } from '@application/user/AdminUserRow'

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  /** Hash de la contraseña local. `null` si la cuenta no tiene una (p. ej. OAuth). */
  findPasswordHash(userId: string): Promise<string | null>
  /** `true` si el usuario existe (sirve para distinguir "no existe" de "sin hash"). */
  exists(userId: string): Promise<boolean>
  create(user: User, passwordHash: string): Promise<void>
  save(user: User): Promise<void>
  updatePassword(userId: string, passwordHash: string): Promise<void>
  /** Panel de admin: todos los usuarios con métricas (login, guardados). Recientes primero. */
  listForAdmin(): Promise<AdminUserRow[]>
  /** Cambia el rol de un usuario (promover/quitar admin). */
  setRole(userId: string, role: UserRole): Promise<void>
  /** Borrado duro. Las cascadas de BD limpian los datos dependientes. */
  delete(userId: string): Promise<void>
}
