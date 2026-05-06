import { Money } from '@domain/shared/Money'
import { SubscriptionStatus } from './SubscriptionStatus'

export interface SubscriptionProps {
  readonly id: string
  readonly listingId: string
  readonly userId: string
  readonly status: SubscriptionStatus
  readonly flowPlanId: string
  readonly flowSubId?: string
  readonly pricePerMonth: Money
  readonly currentPeriodEnd?: Date
  readonly createdAt: Date
}

export class Subscription {
  readonly id: string
  readonly listingId: string
  readonly userId: string
  readonly status: SubscriptionStatus
  readonly flowPlanId: string
  readonly flowSubId?: string
  readonly pricePerMonth: Money
  readonly currentPeriodEnd?: Date
  readonly createdAt: Date

  private constructor(props: SubscriptionProps) {
    this.id = props.id
    this.listingId = props.listingId
    this.userId = props.userId
    this.status = props.status
    this.flowPlanId = props.flowPlanId
    this.flowSubId = props.flowSubId
    this.pricePerMonth = props.pricePerMonth
    this.currentPeriodEnd = props.currentPeriodEnd
    this.createdAt = props.createdAt
  }

  static create(props: SubscriptionProps): Subscription {
    return new Subscription(props)
  }

  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE
  }

  activate(flowSubId: string, currentPeriodEnd: Date): Subscription {
    return new Subscription({
      ...this.toProps(),
      status: SubscriptionStatus.ACTIVE,
      flowSubId,
      currentPeriodEnd,
    })
  }

  markAsPastDue(): Subscription {
    return new Subscription({ ...this.toProps(), status: SubscriptionStatus.PAST_DUE })
  }

  cancel(): Subscription {
    return new Subscription({ ...this.toProps(), status: SubscriptionStatus.CANCELLED })
  }

  private toProps(): SubscriptionProps {
    return {
      id: this.id,
      listingId: this.listingId,
      userId: this.userId,
      status: this.status,
      flowPlanId: this.flowPlanId,
      flowSubId: this.flowSubId,
      pricePerMonth: this.pricePerMonth,
      currentPeriodEnd: this.currentPeriodEnd,
      createdAt: this.createdAt,
    }
  }
}
