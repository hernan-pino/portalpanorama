'use server'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { config } from '@lib/config'
import { Money } from '@domain/shared/Money'
import { SubscriptionAlreadyExistsError } from '@application/errors'
import { UnauthorizedListingAccessError } from '@domain/listing/errors/UnauthorizedListingAccessError'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'

const schema = z.object({ listingId: z.string().min(1) })

export async function startSubscriptionAction(listingId: string): Promise<{ error: string } | void> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  const parsed = schema.safeParse({ listingId })
  if (!parsed.success) return { error: 'Parámetro inválido.' }

  const returnUrl = `${config.baseUrl}/dashboard/suscripcion`

  let paymentUrl: string
  try {
    const result = await container.getCreateSubscriptionUseCase().execute({
      listingId: parsed.data.listingId,
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
    if (error instanceof ListingNotFoundError || error instanceof UnauthorizedListingAccessError) {
      return { error: 'No autorizado.' }
    }
    throw error
  }

  redirect(paymentUrl)
}
