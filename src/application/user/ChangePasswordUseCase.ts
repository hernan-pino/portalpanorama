import { InvalidCurrentPasswordError } from '@domain/user/errors/InvalidCurrentPasswordError'
import { NoPasswordSetError } from '@domain/user/errors/NoPasswordSetError'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { PasswordHasher } from '../ports/PasswordHasher'
import { UserRepository } from '../ports/UserRepository'

export interface ChangePasswordInput {
  userId: string
  currentPassword: string
  newPassword: string
}

// Cambio de contraseña desde la cuenta (usuario ya autenticado). A diferencia del
// reset por email, acá probamos identidad pidiendo la contraseña actual.
// La fuerza de la nueva contraseña la valida la capa de presentación (Zod +
// PasswordPolicy), igual que en el registro y el reset.
export class ChangePasswordUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const currentHash = await this.userRepo.findPasswordHash(input.userId)
    if (currentHash === null) {
      // Distinguir "el usuario no existe" de "existe pero entró por OAuth".
      if (!(await this.userRepo.exists(input.userId))) throw new UserNotFoundError(input.userId)
      throw new NoPasswordSetError()
    }

    const valid = await this.passwordHasher.verify(input.currentPassword, currentHash)
    if (!valid) throw new InvalidCurrentPasswordError()

    const newHash = await this.passwordHasher.hash(input.newPassword)
    await this.userRepo.updatePassword(input.userId, newHash)
  }
}
