import { UserRepository } from '@application/ports/UserRepository'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { CannotDeleteSelfError } from '@domain/user/errors/CannotDeleteSelfError'

export interface DeleteUserInput {
  /** Quién ejecuta la acción (de la sesión). */
  actingUserId: string
  /** A quién se elimina. */
  targetUserId: string
}

// Borrado duro de un usuario. Las cascadas de BD borran sus datos personales
// (listas, historial, reseñas, sesiones) y dejan sus reportes sin dueño; sus
// lugares/marcas NO se borran (ownerId → null). Invariante: un admin no puede
// borrarse a sí mismo (evita quedar sin acceso).
export class DeleteUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute({ actingUserId, targetUserId }: DeleteUserInput): Promise<void> {
    if (actingUserId === targetUserId) throw new CannotDeleteSelfError()
    const target = await this.userRepo.findById(targetUserId)
    if (!target) throw new UserNotFoundError(targetUserId)
    await this.userRepo.delete(targetUserId)
  }
}
