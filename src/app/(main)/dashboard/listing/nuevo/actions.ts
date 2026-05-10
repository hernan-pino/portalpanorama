'use server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { NEIGHBORHOODS } from '@domain/shared/Neighborhoods'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Seleccioná una categoría.'),
  neighborhood: z.enum(NEIGHBORHOODS, { message: 'Barrio inválido.' }),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('URL inválida.').optional().or(z.literal('')),
  priceRange: z.coerce.number().int().min(1).max(4).optional() as z.ZodType<1 | 2 | 3 | 4 | undefined>,
})

export type CreateListingState = {
  error?: string
  fieldErrors?: Record<string, string[]>
} | null

export async function createListingAction(
  _prev: CreateListingState,
  formData: FormData,
): Promise<CreateListingState> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'No autenticado.' }

  const parsed = schema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    categoryId: formData.get('categoryId'),
    neighborhood: formData.get('neighborhood'),
    address: formData.get('address') || undefined,
    phone: formData.get('phone') || undefined,
    website: formData.get('website') || undefined,
    priceRange: formData.get('priceRange') || undefined,
  })

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { listing } = await container.getCreateListingUseCase().execute({
    ...parsed.data,
    ownerId: session.user.id,
  })

  redirect(`/dashboard/listing/${listing.id}/editar`)
}
