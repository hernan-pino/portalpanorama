import { RUT } from '@domain/shared/RUT'
import { UserNotFoundError } from '@domain/user/errors/UserNotFoundError'
import { UserRepository } from '../ports/UserRepository'

export interface UpdateUserProfileInput {
  userId: string
  name: string
  rut?: string
}

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(input: UpdateUserProfileInput): Promise<void> {
    const user = await this.userRepo.findById(input.userId)
    if (!user) throw new UserNotFoundError(input.userId)

    const rut = input.rut ? RUT.create(input.rut) : undefined
    const updated = user.withProfile(input.name, rut)
    await this.userRepo.save(updated)
  }
}
