import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { container } from '@lib/container'
import { auth } from '@lib/auth'
import Link from 'next/link'
import type { BrandPageView } from '@application/ports/BrandRepository'
import { BrandNotFoundError } from '@domain/brand/errors/BrandNotFoundError'
import { PlaceCard } from '@components/place/PlaceCard'
import { brandJsonLd } from './jsonLd'
import { safeJsonLd } from '@lib/jsonLd'

interface PageProps {
  params: Promise<{ slug: string }>
}

function withProtocol(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`
}
function instagramHref(handle: string): string {
  if (/^https?:\/\//.test(handle)) return handle
  return `https://instagram.com/${handle.replace(/^@/, '')}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  let brand: BrandPageView
  try {
    brand = await container.getGetBrandPageUseCase().execute(slug)
  } catch {
    return { title: 'Marca no encontrada' }
  }

  const title = brand.name
  const description =
    brand.description?.slice(0, 160) ??
    `Todos los locales de ${brand.name} en Santiago.`
  const path = `/marca/${slug}`

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title,
      description,
      url: path,
      images: brand.logoUrl ? [{ url: brand.logoUrl, alt: brand.name }] : undefined,
    },
  }
}

export default async function MarcaPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id ?? undefined

  let brand: BrandPageView
  try {
    brand = await container.getGetBrandPageUseCase().execute(slug)
  } catch (error) {
    if (error instanceof BrandNotFoundError) notFound()
    throw error
  }

  const hasLinks = !!(brand.website || brand.instagram || brand.socialLinks.length)

  // Igual que en la ficha: el reclamo solo se ofrece a quien puede hacerlo.
  const claimEligibility = userId
    ? await container.getGetClaimEligibilityUseCase().execute({ claimantId: userId, brandId: brand.id })
    : 'FREE'

  return (
    <div className="brand-page page-enter">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(brandJsonLd(brand, slug)) }}
      />

      <header className="brand-page__head">
        {brand.logoUrl && (
          <div className="brand-page__logo">
            <Image src={brand.logoUrl} alt={brand.name} width={88} height={88} style={{ objectFit: 'contain' }} />
          </div>
        )}
        <div className="brand-page__head-body">
          <p className="eyebrow">Marca</p>
          <h1 className="brand-page__title">{brand.name}</h1>
          {brand.description && <p className="brand-page__lead">{brand.description}</p>}

          {hasLinks && (
            <div className="brand-page__links">
              {brand.website && (
                <a href={withProtocol(brand.website)} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                  Sitio web ↗
                </a>
              )}
              {brand.instagram && (
                <a href={instagramHref(brand.instagram)} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                  Instagram ↗
                </a>
              )}
              {brand.socialLinks.map((s) => (
                <a key={s.url} href={withProtocol(s.url)} target="_blank" rel="noopener noreferrer" className="btn btn--ghost btn--sm">
                  {s.network} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="brand-page__places">
        <h2 className="brand-page__sec-h">
          {brand.places.length === 1 ? '1 local' : `${brand.places.length} locales`}
        </h2>

        {brand.places.length > 0 ? (
          <div className="results-grid">
            {brand.places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <p className="brand-page__empty">
            Esta marca todavía no tiene locales publicados.
          </p>
        )}
      </section>

      {/* Reclamo de la marca (cadena) — CTA destacado, s28 */}
      {claimEligibility === 'FREE' && (
        <aside className="ficha__claim">
          <div>
            <p className="ficha__claim-title">¿Esta marca es tuya?</p>
            <p className="ficha__claim-sub">
              Reclama {brand.name} gratis para gestionar todos sus locales desde una sola cuenta.
            </p>
          </div>
          <div className="ficha__claim-actions">
            <Link href={`/reclamar-marca/${slug}`} className="btn btn--primary btn--sm">
              Reclamar esta marca
            </Link>
            <Link href="/para-negocios" className="btn btn--ghost btn--sm">
              Saber más
            </Link>
          </div>
        </aside>
      )}

      {claimEligibility === 'OWNED_BY_YOU' && (
        <aside className="ficha__claim">
          <div>
            <p className="ficha__claim-title">Esta marca es tuya</p>
            <p className="ficha__claim-sub">
              Gestiona sus locales desde tu panel de negocio.
            </p>
          </div>
          <div className="ficha__claim-actions">
            <Link href="/mi-negocio" className="btn btn--primary btn--sm">
              Ir a mi panel
            </Link>
          </div>
        </aside>
      )}

      {claimEligibility === 'PENDING_YOURS' && (
        <aside className="ficha__claim">
          <div>
            <p className="ficha__claim-title">Tu solicitud está en revisión</p>
            <p className="ficha__claim-sub">
              Estamos revisando a mano que esta marca sea tuya. Te avisamos por correo apenas quede lista.
            </p>
          </div>
          <div className="ficha__claim-actions">
            <Link href="/mi-negocio" className="btn btn--ghost btn--sm">
              Ver en qué va
            </Link>
          </div>
        </aside>
      )}
    </div>
  )
}
