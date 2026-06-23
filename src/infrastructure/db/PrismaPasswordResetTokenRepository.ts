import { PrismaClient } from '@prisma/client'
import {
  PasswordResetTokenRecord,
  PasswordResetTokenRepository,
} from '@application/ports/PasswordResetTokenRepository'

export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(token: PasswordResetTokenRecord): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: {
        userId: token.userId,
        tokenHash: token.tokenHash,
        expiresAt: token.expiresAt,
      },
    })
  }

  async findValidUserId(tokenHash: string): Promise<string | null> {
    const row = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } })
    if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) return null
    return row.userId
  }

  async markUsed(tokenHash: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    })
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({ where: { userId } })
  }
}
