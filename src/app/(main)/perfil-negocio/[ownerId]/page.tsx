import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { container } from '@lib/container'
import { ListingCard } from '@components/listing/ListingCard'

const getOwnerProfile = cache((ownerId: string) =>
  container.getGetOwnerProfileUseCase().execute({ ownerId }),
)

interface PageProps {
  params: Promise<{ ownerId: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ownerId } = await params
  const result = await getOwnerProfile(ownerId)
  if (!result) return { title: 'Perfil no encontrado' }
  return {
    title: `${result.owner.name} — Portal Panorama`,
    description: `Lugares publicados por ${result.owner.name} en Portal Panorama`,
  }
}

export default async function PerfilNegocioPage({ params }: PageProps) {
  const { ownerId } = await params

  const result = await getOwnerProfile(ownerId)
  if (!result) notFound()

  const { owner, listings } = result

  const memberYear = owner.memberSince.getFullYear()
  const memberMonth = owner.memberSince.toLocaleString('es-CL', { month: 'long' })

  return (
    <div className="page-enter">
      <div className="container">

        {/* ── Header del perfil ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--s-6)',
          padding: 'var(--s-10) 0',
          borderBottom: '1px solid var(--surface-line)',
          marginBottom: 'var(--s-10)',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--accent-20)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--t-h3)',
              fontWeight: 400,
              color: 'var(--accent-60)',
              letterSpacing: 'var(--tr-tight)',
            }}>
              {owner.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--t-h2)',
              fontWeight: 400,
              letterSpacing: 'var(--tr-tight)',
              margin: 0,
            }}>
              {owner.name}
            </h1>
            <p className="eyebrow">
              Miembro desde {memberMonth} {memberYear}
              {listings.length > 0 && (
                <> · {listings.length} {listings.length === 1 ? 'lugar publicado' : 'lugares publicados'}</>
              )}
            </p>
          </div>
        </div>

        {/* ── Listados del negocio ── */}
        {listings.length > 0 ? (
          <section>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--t-h3)',
              fontWeight: 400,
              marginBottom: 'var(--s-8)',
              letterSpacing: 'var(--tr-tight)',
            }}>
              Lugares publicados
            </h2>
            <div className="grid-cards">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.slug}
                  listing={{
                    slug: listing.slug,
                    name: listing.name,
                    neighborhood: listing.neighborhood,
                    coverUrl: listing.coverUrl,
                    isPremium: listing.isPremium,
                    tags: listing.tags,
                    priceRange: listing.priceRange,
                  }}
                />
              ))}
            </div>
          </section>
        ) : (
          <div style={{
            padding: 'var(--s-16)',
            textAlign: 'center',
            color: 'var(--fg-muted)',
          }}>
            <p>Este negocio aún no tiene lugares publicados.</p>
          </div>
        )}

        <div style={{ marginTop: 'var(--s-12)', paddingTop: 'var(--s-8)', borderTop: '1px solid var(--surface-line)' }}>
          <Link href="/explorar" className="btn btn--ghost btn--sm">
            ← Explorar todos los lugares
          </Link>
        </div>

      </div>
    </div>
  )
}
