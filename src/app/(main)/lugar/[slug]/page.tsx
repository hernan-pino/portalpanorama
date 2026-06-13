import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import type { PlaceDetailView, PlaceCardView } from '@application/ports/PlaceRepository'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { Collection } from '@domain/collection/Collection'
import { Gallery } from './Gallery'
import { SaveButton } from './SaveButton'
import { ShareButton } from './ShareButton'
import { ReportButton } from './ReportButton'
import {
  PinIcon, NavIcon, WalletIcon, ClockIcon, TicketIcon, CardIcon, MetroIcon,
  AccessIcon, UmbrellaIcon, PhoneIcon, GlobeIcon, InstagramIcon, MenuIcon, StarIcon,
} from './icons'

interface PageProps {
  params: Promise<{ slug: string }>
}

// ── Etiquetas de los enums (presentación, no dominio) ──
const PRICE_LABELS: Record<string, string> = {
  FREE: 'Gratis',
  UNDER_5000: 'Menos de $5.000',
  FROM_5000_TO_15000: '$5.000–15.000',
  FROM_15000_TO_30000: '$15.000–30.000',
  OVER_30000: 'Más de $30.000',
}
const PRICE_ORDER = ['FREE', 'UNDER_5000', 'FROM_5000_TO_15000', 'FROM_15000_TO_30000', 'OVER_30000']

const RESERVATION_LABELS: Record<string, string> = {
  REQUIRED: 'Requiere reserva',
  RECOMMENDED: 'Reserva recomendada',
  WALK_IN: 'Llega no más, sin reserva',
}
const RAIN_LABELS: Record<string, string> = {
  SUSPENDED: 'Si llueve se suspende',
  RELOCATED: 'Con lluvia se traslada a un espacio techado',
  CONTINUES: 'Funciona igual con lluvia',
}

const fmtCount = (n: number) => n.toLocaleString('es-CL')

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const { place } = await container.getGetPlaceBySlugUseCase().execute(slug)
    return {
      title: `${place.name} · ${place.commune.name}`,
      description: place.description?.slice(0, 160),
    }
  } catch {
    return { title: 'Lugar no encontrado' }
  }
}

export default async function LugarPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id ?? undefined

  let place: PlaceDetailView
  let related: PlaceCardView[]
  try {
    const result = await container.getGetPlaceBySlugUseCase().execute(slug)
    place = result.place
    related = result.related
  } catch (error) {
    if (error instanceof PlaceNotFoundError) notFound()
    throw error
  }

  // Combustible IA (post-MVP): registrar visita del usuario logueado. Las listas
  // del usuario + qué ya guardó alimentan el botón "Guardar".
  let collections: { id: string; name: string; itemCount: number }[] = []
  let defaultCollectionId: string | null = null
  let isSaved = false
  if (userId) {
    const ctx = await container.getGetSaveContextUseCase().execute(userId)
    collections = ctx.collections.map((c) => ({ id: c.id, name: c.name, itemCount: c.itemCount }))
    defaultCollectionId = ctx.defaultCollectionId
    isSaved = ctx.savedPlaceIds.includes(place.id)
    await container.getRecordVisitUseCase().execute({ userId, placeId: place.id })
  }

  const social = place.tags.filter((t) => t.layer === 'SOCIAL')
  const vibe = place.tags.filter((t) => t.layer === 'VIBE')
  const attribute = place.tags.filter((t) => t.layer === 'ATTRIBUTE')
  const access = place.tags.filter((t) => t.layer === 'ACCESS')

  const hasContact = !!(place.phone || place.website || place.instagram || place.menuUrl)
  const hasAccess = !!(place.accessDetail || access.length)
  const directionsHref = place.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`
    : undefined

  const saveButton = (
    <SaveButton
      placeId={place.id}
      isLoggedIn={!!userId}
      isSaved={isSaved}
      collections={collections}
      defaultCollectionId={defaultCollectionId}
      defaultName={Collection.DEFAULT_NAME}
    />
  )

  return (
    <div className="ficha page-enter">

      {/* ── Hero + galería navegable (lightbox) ── */}
      <Gallery
        images={place.images}
        name={place.name}
        actions={<ShareButton name={place.name} variant="fab" />}
      />

      <div className="ficha__sheet">

        {/* encabezado */}
        <div className="ficha__head">
          <div className="ficha__cats">
            <span className="chip chip--accent">{place.category.name}</span>
            <span className="chip">{place.subcategory.name}</span>
            {place.secondaryCategory && place.secondaryCategory.slug !== place.category.slug && (
              <span className="chip">{place.secondaryCategory.name}</span>
            )}
          </div>

          <h1 className="ficha__title">{place.name}</h1>

          <div className="ficha__loc">
            <PinIcon />
            <span>{place.neighborhood ? `${place.neighborhood.name} · ` : ''}{place.commune.name}</span>
          </div>

          {place.googleRating != null && (
            <div className="ficha__rating">
              <Stars value={place.googleRating} />
              <span className="num">{place.googleRating.toFixed(1)}</span>
              {place.googleReviewCount != null && <span>({fmtCount(place.googleReviewCount)}) · Google</span>}
            </div>
          )}
        </div>

        {/* CTAs */}
        <div className="ficha__cta">
          {saveButton}
          {directionsHref && (
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
              <NavIcon /> Cómo llegar
            </a>
          )}
          <ShareButton name={place.name} variant="button" />
        </div>

        {/* descripción + tags */}
        {(place.description || social.length > 0 || vibe.length > 0 || attribute.length > 0) && (
          <div className="ficha__section">
            {place.description && <p className="ficha__lead">{place.description}</p>}
            <TagGroup label="Con quién" tags={social} />
            <TagGroup label="Ambiente" tags={vibe} />
            <TagGroup label="Lo que ofrece" tags={attribute} />
          </div>
        )}

        {/* datos prácticos */}
        <div className="ficha__section">
          <h2 className="ficha__sec-h">Datos prácticos</h2>
          <div className="ficha__card">
            {place.priceRange && (
              <DataRow icon={<WalletIcon />} k="Precio">
                <PriceScale value={place.priceRange} />
              </DataRow>
            )}
            {place.schedule && <DataRow icon={<ClockIcon />} k="Horario">{place.schedule}</DataRow>}
            {place.reservation && (
              <DataRow icon={<TicketIcon />} k="Reserva">
                {RESERVATION_LABELS[place.reservation] ?? place.reservation}
              </DataRow>
            )}
            {place.paymentMethods.length > 0 && (
              <DataRow icon={<CardIcon />} k="Pagos">
                <div className="ficha__tags" style={{ marginTop: 2 }}>
                  {place.paymentMethods.map((m) => <span key={m} className="chip">{m}</span>)}
                </div>
              </DataRow>
            )}
            {place.metroStation && (
              <DataRow icon={<MetroIcon />} k="Metro">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                  {place.metroStation.name}
                  <span className="ficha__metro-lines">
                    {place.metroStation.lines.map((l) => (
                      <span key={l.code} className="ficha__metro-line" style={{ background: l.color }}>{l.code}</span>
                    ))}
                  </span>
                </span>
              </DataRow>
            )}
            {hasAccess && (
              <DataRow icon={<AccessIcon />} k="Accesibilidad">
                {place.accessDetail}
                {access.length > 0 && (
                  <div className="ficha__tags" style={{ marginTop: place.accessDetail ? 8 : 2 }}>
                    {access.map((t) => <span key={t.slug} className="chip">{t.name}</span>)}
                  </div>
                )}
              </DataRow>
            )}
            {place.reference && <DataRow icon={<PinIcon />} k="Cómo ubicarlo">{place.reference}</DataRow>}
            {place.rainPolicy && (
              <DataRow icon={<UmbrellaIcon />} k="Si llueve">
                {RAIN_LABELS[place.rainPolicy] ?? place.rainPolicy}
              </DataRow>
            )}
          </div>
        </div>

        {/* contacto */}
        {hasContact && (
          <div className="ficha__section">
            <h2 className="ficha__sec-h">Contacto</h2>
            <div className="ficha__contact">
              {place.phone && (
                <ContactRow icon={<PhoneIcon />} k="Teléfono" v={place.phone} href={`tel:${place.phone}`} />
              )}
              {place.website && (
                <ContactRow icon={<GlobeIcon />} k="Sitio web" v={place.website} href={withProtocol(place.website)} />
              )}
              {place.instagram && (
                <ContactRow icon={<InstagramIcon />} k="Instagram" v={place.instagram} href={instagramHref(place.instagram)} />
              )}
              {place.menuUrl && (
                <ContactRow icon={<MenuIcon />} k="Menú" v="Ver la carta" href={place.menuUrl} />
              )}
            </div>
          </div>
        )}

        {/* relacionados */}
        {related.length > 0 && (
          <div className="ficha__section">
            <h2 className="ficha__sec-h">También te puede gustar</h2>
            <div className="ficha__rel">
              {related.map((r) => <RelCard key={r.id} place={r} />)}
            </div>
          </div>
        )}

        {/* reportar */}
        <div className="ficha__report">
          <div className="ficha__report-hr" />
          <ReportButton placeId={place.id} />
        </div>
      </div>

      {/* barra de acción fija (móvil) */}
      <div className="ficha__bar">
        <div className="ficha__bar-row">
          {saveButton}
          {directionsHref && (
            <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="btn btn--ghost" style={{ justifyContent: 'center' }}>
              <NavIcon /> Cómo llegar
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Subcomponentes de presentación (server) ── */

function TagGroup({ label, tags }: { label: string; tags: { slug: string; name: string }[] }) {
  if (tags.length === 0) return null
  return (
    <div className="ficha__taggroup">
      <div className="ficha__taglabel">{label}</div>
      <div className="ficha__tags">
        {tags.map((t) => <span key={t.slug} className="chip">{t.name}</span>)}
      </div>
    </div>
  )
}

function DataRow({ icon, k, children }: { icon: React.ReactNode; k: string; children: React.ReactNode }) {
  return (
    <div className="ficha__drow">
      <div className="ic">{icon}</div>
      <div>
        <div className="k">{k}</div>
        <div className="v">{children}</div>
      </div>
    </div>
  )
}

function PriceScale({ value }: { value: string }) {
  const idx = PRICE_ORDER.indexOf(value)
  return (
    <div className="ficha__price">
      <div className="ficha__price-bars">
        {PRICE_ORDER.map((_, i) => (
          <span key={i} className={`ficha__price-bar${idx >= 0 && i <= idx ? ' is-on' : ''}`} />
        ))}
      </div>
      <span className="ficha__price-label">{PRICE_LABELS[value] ?? value}</span>
    </div>
  )
}

function ContactRow({ icon, k, v, href }: { icon: React.ReactNode; k: string; v: string; href: string }) {
  const external = href.startsWith('http')
  return (
    <a className="ficha__crow" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      <span className="ci">{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span className="ck">{k}</span>
        <span className="cv">{v}</span>
      </span>
    </a>
  )
}

function RelCard({ place }: { place: PlaceCardView }) {
  return (
    <Link href={`/lugar/${place.slug}`} className="ficha__relcard">
      <div className="ficha__relcard-media">
        {place.coverUrl ? (
          <Image src={place.coverUrl} alt={place.name} fill sizes="(max-width: 600px) 50vw, 200px" style={{ objectFit: 'cover' }} />
        ) : (
          <div className="placeholder-stripe" style={{ width: '100%', height: '100%' }} />
        )}
      </div>
      <div className="ficha__relcard-body">
        <div className="ficha__relcard-name">{place.name}</div>
        <div className="ficha__relcard-meta">{place.categoryName} · {place.communeName}</div>
        <div className="ficha__relcard-foot">
          {place.priceRange && <span className="ficha__relcard-price">{PRICE_LABELS[place.priceRange] ?? place.priceRange}</span>}
          {place.googleRating != null && (
            <span className="ficha__relcard-rate"><StarIcon /> {place.googleRating.toFixed(1)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

// Estrellas de Google: relleno parcial por clip de ancho (4.6 → 92%).
function Stars({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100))
  return (
    <span className="ficha__stars" aria-label={`${value} de 5 en Google`}>
      <span className="row row--empty">
        {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} outline />)}
      </span>
      <span className="fill" style={{ width: `${pct}%` }}>
        <span className="row row--full">
          {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} />)}
        </span>
      </span>
    </span>
  )
}

function withProtocol(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`
}
function instagramHref(handle: string): string {
  if (/^https?:\/\//.test(handle)) return handle
  return `https://instagram.com/${handle.replace(/^@/, '')}`
}
