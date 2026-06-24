import { UserRepository } from '@application/ports/UserRepository'
import { UserRole } from '@domain/user/UserRole'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { CannotDemoteSelfError } from '@domain/user/errors/CannotDemoteSelfError'

export interface SetUserRoleInput {
  /** Quién ejecuta la acción (de la sesión). */
  actingUserId: string
  /** A quién se le cambia el rol. */
  targetUserId: string
  role: UserRole
}

// Promueve o quita el rol ADMIN. Invariante de seguridad: un admin no puede
// quitarse el rol a sí mismo (evita quedar fuera del panel). Como el actor
// siempre conserva su admin, nunca se llega a cero administradores por esta vía.
export class SetUserRoleUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute({ actingUserId, targetUserId, role }: SetUserRoleInput): Promise<void> {
    if (actingUserId === targetUserId && role !== UserRole.ADMIN) {
      throw new CannotDemoteSelfError()
    }
    const target = await this.userRepo.findById(targetUserId)
    if (!target) throw new UserNotFoundError(targetUserId)
    if (target.role === role) return // ya está en ese rol: no-op idempotente
    await this.userRepo.setRole(targetUserId, role)
  }
}
