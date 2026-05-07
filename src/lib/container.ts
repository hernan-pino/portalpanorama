import { prisma } from './db'
import { PrismaUserRepository } from '@infrastructure/db/PrismaUserRepository'
import { BcryptPasswordHasher } from '@infrastructure/auth/BcryptPasswordHasher'
import { ResendEmailService } from '@infrastructure/email/ResendEmailService'
import { RegisterUserUseCase } from '@application/user/RegisterUserUseCase'

export const container = {
  getRegisterUserUseCase() {
    return new RegisterUserUseCase(
      new PrismaUserRepository(prisma),
      new BcryptPasswordHasher(),
      new ResendEmailService(),
    )
  },
}
