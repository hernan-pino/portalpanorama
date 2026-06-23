import { Prisma, PrismaClient } from '@prisma/client'
import { User } from '@domain/user/User'
import { UserRole } from '@domain/user/UserRole'
import { Email } from '@domain/shared/Email'
import { UserRepository } from '@application/ports/UserRepository'

type UserRow = Prisma.UserGetPayload<Record<string, never>>

function toUserDomain(row: UserRow): User {
  return User.create({
    id: row.id,
    email: Email.create(row.email),
    name: row.name,
    role: row.role as UserRole,
    homeCommuneId: row.homeCommuneId ?? undefined,
    createdAt: row.createdAt,
  })
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    return row ? toUserDomain(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } })
    return row ? toUserDomain(row) : null
  }

  async create(user: User, passwordHash: string): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        role: user.role,
        homeCommuneId: user.homeCommuneId ?? null,
        passwordHash,
        createdAt: user.createdAt,
      },
    })
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email.value,
        name: user.name,
        role: user.role,
        homeCommuneId: user.homeCommuneId ?? null,
      },
    })
  }

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } })
  }
}
