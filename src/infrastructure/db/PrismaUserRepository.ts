import { Prisma, PrismaClient } from '@prisma/client'
import { User } from '@domain/user/User'
import { UserRole } from '@domain/user/UserRole'
import { Email } from '@domain/shared/Email'
import { UserRepository } from '@application/ports/UserRepository'
import { AdminUserRow, UserAuthMethod } from '@application/user/AdminUserRow'

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

  async findPasswordHash(userId: string): Promise<string | null> {
    const row = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    })
    return row?.passwordHash ?? null
  }

  async exists(userId: string): Promise<boolean> {
    const row = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    return row !== null
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

  async listForAdmin(): Promise<AdminUserRow[]> {
    const rows = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        createdAt: true,
        // ¿Tiene contraseña local y/o cuenta OAuth? Basta saber si hay ≥1 cuenta.
        accounts: { select: { provider: true }, take: 1 },
        // Lugares guardados = ítems sumados sobre todas sus listas.
        collections: { select: { _count: { select: { items: true } } } },
      },
    })

    return rows.map((r): AdminUserRow => {
      // El flujo de Google hace upsert del User por email SIN crear fila Account
      // (sesión JWT), así que un usuario sin contraseña entró por Google. La fila
      // Account, si existe, confirma el OAuth (caso "both" si además tiene contraseña).
      const hasPassword = r.passwordHash != null
      const hasOauthAccount = r.accounts.length > 0
      const authMethod: UserAuthMethod =
        hasPassword && hasOauthAccount ? 'both' : hasPassword ? 'password' : 'oauth'
      const savedCount = r.collections.reduce((sum, c) => sum + c._count.items, 0)
      return {
        id: r.id,
        email: r.email,
        name: r.name,
        role: r.role as UserRole,
        authMethod,
        savedCount,
        createdAt: r.createdAt,
      }
    })
  }

  async setRole(userId: string, role: UserRole): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { role } })
  }
}
