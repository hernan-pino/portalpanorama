import { Prisma, PrismaClient } from '@prisma/client'
import { Subscription } from '@domain/subscription/Subscription'
import { SubscriptionStatus } from '@domain/subscription/SubscriptionStatus'
import { Money } from '@domain/shared/Money'
import { SubscriptionRepository } from '@application/ports/SubscriptionRepository'

type SubscriptionRow = Prisma.SubscriptionGetPayload<Record<string, never>>

function toSubscriptionDomain(row: SubscriptionRow): Subscription {
  return Subscription.create({
    id: row.id,
    listingId: row.listingId,
    userId: row.userId,
    status: row.status as SubscriptionStatus,
    flowPlanId: row.flowPlanId,
    flowSubId: row.flowSubId ?? undefined,
    pricePerMonth: Money.create(row.pricePerMonthAmount),
    currentPeriodEnd: row.currentPeriodEnd ?? undefined,
    createdAt: row.createdAt,
  })
}

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByListingId(listingId: string): Promise<Subscription | null> {
    const row = await this.prisma.subscription.findUnique({ where: { listingId } })
    return row ? toSubscriptionDomain(row) : null
  }

  async findByFlowSubId(flowSubId: string): Promise<Subscription | null> {
    const row = await this.prisma.subscription.findUnique({ where: { flowSubId } })
    return row ? toSubscriptionDomain(row) : null
  }

  async save(subscription: Subscription): Promise<void> {
    const data = {
      listingId: subscription.listingId,
      userId: subscription.userId,
      status: subscription.status,
      flowPlanId: subscription.flowPlanId,
      flowSubId: subscription.flowSubId ?? null,
      pricePerMonthAmount: subscription.pricePerMonth.amount,
      currentPeriodEnd: subscription.currentPeriodEnd ?? null,
    }

    await this.prisma.subscription.upsert({
      where: { id: subscription.id },
      create: { id: subscription.id, createdAt: subscription.createdAt, ...data },
      update: data,
    })
  }
}
