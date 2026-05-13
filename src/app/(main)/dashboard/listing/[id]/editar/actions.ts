'use server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { NEIGHBORHOODS } from '@domain/shared/Neighborhoods'
import { UnauthorizedListingAccessError } from '@domain/listing/errors/UnauthorizedListingAccessError'
import { ListingNotFoundError } from '@domain/listing/errors/ListingNotFoundError'
import { InvalidListingTransitionError } from '@domain/listing/Listing'

const updateSchema = z.object({
  listingId: z.string().min(1),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  neighborhood: z.enum(NEIGHBORHOODS).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('URL inválida.').refine((v) => /^https?:\/\//i.test(v), 'Solo se permiten URLs con http o https.').optional().or(z.literal('')),
  priceRange: z.coerce.number().int().min(1).max(4).optional() as z.ZodType<1 | 2 | 3 | 4 | undefined>,
})

export type EditListingState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
} | null

export async function updateListingAction(
  _prev: EditListingState,
  formData: FormData,
): Promise<EditListingState> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  const parsed = updateSchema.safeParse({
    listingId: formData.get('listingId'),
    name: formData.get('name') || undefined,
    description: formData.get('description') || undefined,
    categoryId: formData.get('categoryId') || undefined,
    neighborhood: formData.get('neighborhood') || undefined,
    address: formData.get('address') || undefined,
    phone: formData.get('phone') || undefined,
    website: formData.get('website') || undefined,
    priceRange: formData.get('priceRange') || undefined,
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  try {
    await container.getUpdateListingUseCase().execute({
      ...parsed.data,
      userId: session.user.id,
    })
  } catch (error) {
    if (error instanceof UnauthorizedListingAccessError) return { error: 'No tenés permiso para editar este listing.' }
    if (error instanceof ListingNotFoundError) return { error: 'Listing no encontrado.' }
    throw error
  }

  return { success: true }
}

export async function publishListingAction(listingId: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  try {
    await container.getPublishListingUseCase().execute({
      listingId,
      userId: session.user.id,
    })
  } catch (error) {
    if (error instanceof UnauthorizedListingAccessError) return { error: 'No tenés permiso.' }
    if (error instanceof ListingNotFoundError) return { error: 'Listing no encontrado.' }
    if (error instanceof InvalidListingTransitionError) return { error: 'El listing no puede publicarse desde su estado actual.' }
    throw error
  }

  redirect(`/dashboard`)
}
