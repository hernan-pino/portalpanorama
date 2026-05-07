import { Prisma, PrismaClient } from '@prisma/client'
import { Listing } from '@domain/listing/Listing'
import { User } from '@domain/user/User'
import { UserRole } from '@domain/user/UserRole'
import { Email } from '@domain/shared/Email'
import { RUT } from '@domain/shared/RUT'
import { UserRepository } from '@application/ports/UserRepository'
import { toListingDomain } from './PrismaListingRepository'

type UserRow = Prisma.UserGetPayload<Record<string, never>>

function toUserDomain(row: UserRow): User {
  return User.create({
    id: row.id,
    email: Email.create(row.email),
    name: row.name,
    role: row.role as UserRole,
    rut: row.rut ? RUT.create(row.rut) : undefined,
    createdAt: row.createdAt,
  })
}

const LISTING_INCLUDE = { images: true, tags: true } as const

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
        rut: user.rut?.value ?? null,
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
        rut: user.rut?.value ?? null,
      },
    })
  }

  async addFavorite(userId: string, listingId: string): Promise<void> {
    await this.prisma.userFavorite.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: { userId, listingId },
      update: {},
    })
  }

  async removeFavorite(userId: string, listingId: string): Promise<void> {
    await this.prisma.userFavorite.deleteMany({ where: { userId, listingId } })
  }

  async isFavorite(userId: string, listingId: string): Promise<boolean> {
    const row = await this.prisma.userFavorite.findUnique({
      where: { userId_listingId: { userId, listingId } },
    })
    return row !== null
  }

  async findFavoriteListings(userId: string): Promise<Listing[]> {
    const rows = await this.prisma.listing.findMany({
      where: { favorites: { some: { userId } } },
      include: LISTING_INCLUDE,
      orderBy: { name: 'asc' },
    })
    return rows.map(toListingDomain)
  }

  async findUserIdsWithFavorite(listingId: string): Promise<string[]> {
    const rows = await this.prisma.userFavorite.findMany({
      where: { listingId },
      select: { userId: true },
    })
    return rows.map((r) => r.userId)
  }
}
