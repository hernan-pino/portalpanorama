'use server'
import { redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { config } from '@lib/config'
import { Money } from '@domain/shared/Money'
import { SubscriptionAlreadyExistsError } from '@application/errors'

export async function startSubscriptionAction(listingId: string): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  const returnUrl = `${config.baseUrl}/dashboard/suscripcion`

  let paymentUrl: string
  try {
    const result = await container.getCreateSubscriptionUseCase().execute({
      listingId,
      userId: session.user.id,
      flowPlanId: config.flowPlanId,
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
