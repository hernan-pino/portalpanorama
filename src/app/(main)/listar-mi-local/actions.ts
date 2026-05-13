'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { config } from '@lib/config'
import { container } from '@lib/container'
import { isValidNeighborhood, Neighborhood } from '@domain/shared/Neighborhoods'
import { Money } from '@domain/shared/Money'

// ── createBusinessAction ─────────────────────────────────────────────────────

const businessSchema = z.object({
  plan: z.enum(['free', 'premium']),
  name: z.string().min(2, 'Al menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  neighborhood: z.string().refine(isValidNeighborhood, 'Barrio inválido'),
  address: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url('URL inválida.').refine((v) => /^https?:\/\//i.test(v), 'Solo se permiten URLs con http o https.').optional().or(z.literal('')),
})

export type CreateBusinessState = {
  error?: string
  fieldErrors?: Partial<Record<string, string[]>>
}

export async function createBusinessAction(
  _prev: CreateBusinessState,
  formData: FormData,
): Promise<CreateBusinessState> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/listar-mi-local/step2')

  const parsed = businessSchema.safeParse({
    plan: formData.get('plan'),
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    categoryId: formData.get('categoryId'),
    neighborhood: formData.get('neighborhood'),
    address: formData.get('address') || undefined,
    phone: formData.get('phone') || undefined,
    website: formData.get('website') || undefined,
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const { plan, neighborhood, website, ...rest } = parsed.data

  let listingId: string
  try {
    const result = await container.getBecomeBusinessOwnerUseCase().execute({
      userId: session.user.id,
      neighborhood: neighborhood as Neighborhood,
      website: website || undefined,
      ...rest,
    })
    listingId = result.listingId
  } catch {
    return { error: 'Error al crear el negocio. Intenta nuevamente.' }
  }

  if (plan === 'free') {
    redirect(`/listar-mi-local/step4?listingId=${listingId}&plan=free`)
  } else {
    redirect(`/listar-mi-local/step3?listingId=${listingId}`)
  }
}

// ── startSubscriptionAction ──────────────────────────────────────────────────

export type StartSubscriptionState = { error?: string }

export async function startSubscriptionAction(
  _prev: StartSubscriptionState,
  formData: FormData,
): Promise<StartSubscriptionState> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const listingIdRaw = z.string().min(1).max(36).regex(/^[a-z0-9]+$/).safeParse(formData.get('listingId'))
  if (!listingIdRaw.success) return { error: 'Datos inválidos' }
  const listingId = listingIdRaw.data

  let paymentUrl: string
  try {
    const result = await container.getCreateSubscriptionUseCase().execute({
      listingId,
      userId: session.user.id,
      flowPlanId: config.flowPlanId,
      pricePerMonth: Money.create(24900),
      returnUrl: `${config.baseUrl}/listar-mi-local/step4?listingId=${listingId}&plan=premium`,
    })
    paymentUrl = result.paymentUrl
  } catch {
    return { error: 'Error al iniciar el pago. Intenta nuevamente.' }
  }

  redirect(paymentUrl)
}
