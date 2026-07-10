import { PrismaClient } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import {
  NewSuggestion,
  SuggestionAdminRow,
  SuggestionRepository,
} from '@application/ports/SuggestionRepository'
import { SuggestionKind } from '@domain/suggestion/SuggestionKind'
import { SuggestionStatus } from '@domain/suggestion/SuggestionStatus'

export class PrismaSuggestionRepository implements SuggestionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(s: NewSuggestion): Promise<void> {
    await this.prisma.suggestion.create({
      data: {
        id: createId(),
        kind: s.kind,
        message: s.message,
        email: s.email ?? null,
        userId: s.userId ?? null,
      },
    })
  }

  async listForAdmin(): Promise<SuggestionAdminRow[]> {
    const rows = await this.prisma.suggestion.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        kind: true,
        message: true,
        email: true,
        status: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    })
    return rows.map((r) => ({
      id: r.id,
      kind: r.kind as SuggestionKind,
      message: r.message,
      email: r.email,
      userEmail: r.user?.email ?? null,
      status: r.status as SuggestionStatus,
      createdAt: r.createdAt,
    }))
  }

  async countOpen(): Promise<number> {
    return this.prisma.suggestion.count({ where: { status: SuggestionStatus.OPEN } })
  }

  async setStatus(suggestionId: string, status: SuggestionStatus): Promise<void> {
    await this.prisma.suggestion.update({
      where: { id: suggestionId },
      data: { status, resolvedAt: status === SuggestionStatus.OPEN ? null : new Date() },
    })
  }

  async delete(suggestionId: string): Promise<void> {
    await this.prisma.suggestion.delete({ where: { id: suggestionId } })
  }
}
