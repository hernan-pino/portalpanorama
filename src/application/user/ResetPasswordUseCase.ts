import { InvalidResetTokenError } from '@domain/user/errors/InvalidResetTokenError'
import { PasswordHasher } from '../ports/PasswordHasher'
import { UserRepository } from '../ports/UserRepository'
import { PasswordResetTokenRepository } from '../ports/PasswordResetTokenRepository'
import { TokenGenerator } from '../ports/TokenGenerator'

export interface ResetPasswordInput {
  rawToken: string
  newPassword: string
}

export class ResetPasswordUseCase {
  constructor(
    private readonly tokenRepo: PasswordResetTokenRepository,
    private readonly userRepo: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenGenerator,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const tokenHash = this.tokens.hash(input.rawToken)
    const userId = await this.tokenRepo.findValidUserId(tokenHash)
    if (!userId) throw new InvalidResetTokenError()

    const passwordHash = await this.passwordHasher.hash(input.newPassword)
    await this.userRepo.updatePassword(userId, passwordHash)
    await this.tokenRepo.markUsed(tokenHash)
  }
}
