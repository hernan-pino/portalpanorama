'use server'
import { redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { Money } from '@domain/shared/Money'
import { SubscriptionAlreadyExistsError } from '@application/errors'

const FLOW_PLAN_ID = process.env.FLOW_PLAN_ID ?? 'plan_premium_cl'

export async function startSubscriptionAction(listingId: string): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  const returnUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/dashboard/suscripcion`

  let paymentUrl: string
  try {
    const result = await container.getCreateSubscriptionUseCase().execute({
      listingId,
      userId: session.user.id,
      flowPlanId: FLOW_PLAN_ID,
      pricePerMonth: Money.create(0),
      returnUrl,
    })
    paymentUrl = result.paymentUrl
  } catch (error) {
    if (error instanceof SubscriptionAlreadyExistsError) {
      return { error: 'Este listing ya tiene una suscripción activa.' }
    }
    throw error
  }

  redirect(paymentUrl)
}
