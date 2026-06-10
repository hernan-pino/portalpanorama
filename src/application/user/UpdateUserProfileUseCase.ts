import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { UserRepository } from '../ports/UserRepository'

export interface UpdateUserProfileInput {
  userId: string
  name: string
  // Comuna home opcional (C.3-bis). undefined deja la preferencia sin cambios;
  // null explícito la limpia → lo maneja presentation al armar el input.
  homeCommuneId?: string
}

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: UpdateUserProfileInput): Promise<void> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new UserNotFoundError(input.userId)

    const updated = user.withProfile(input.name, input.homeCommuneId)
    await this.userRepo.save(updated)
  }
}
