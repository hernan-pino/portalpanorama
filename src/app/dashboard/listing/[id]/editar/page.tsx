import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { ListingStatus } from '@domain/listing/ListingStatus'
import { EditListingForm } from './EditListingForm'
import { PublishButton } from './PublishButton'

export const metadata: Metadata = { title: 'Editar listing' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarListingPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const listing = await container.getGetOwnedListingUseCase().execute({ listingId: id, userId: session.user.id })
  if (!listing) notFound()

  const categories = await container.getCategories()

  const listingData = {
    id: listing.id,
    name: listing.name,
    description: listing.description,
    categoryId: listing.categoryId,
    neighborhood: listing.neighborhood,
    address: listing.address,
    phone: listing.phone,
    website: listing.website,
    priceRange: listing.priceRange,
    status: listing.status,
    slug: listing.slug.value,
  }

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)', maxWidth: '640px' }}>
      <div
        style={{
          marginBottom: 'var(--s-8)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--s-4)',
        }}
      >
        <div>
          <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
            Editar listing
          </h1>
          <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
            {listing.name}
          </p>
        </div>
        {listing.status === ListingStatus.DRAFT && (
          <PublishButton listingId={listing.id} />
        )}
      </div>

      <EditListingForm listing={listingData} categories={categories} />
    </div>
  )
}
