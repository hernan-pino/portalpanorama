import type { Metadata } from 'next'
import { after } from 'next/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import type { PlaceDetailView, PlaceCardView } from '@application/ports/PlaceRepository'
import type { SaveContextOutput } from '@application/collection/GetSaveContextUseCase'
import { PlaceNotFoundError } from '@domain/place/errors/PlaceNotFoundError'
import { Collection } from '@domain/collection/Collection'
import { PlaceCard } from '@components/place/PlaceCard'
import { PlaceRail } from '@components/place/PlaceRail'
import { Gallery } from './Gallery'
import { StickyActionBar } from './StickyActionBar'
import { PointsList } from './PointsList'
import { RichText } from './RichText'
import { SaveButton } from './SaveButton'
import { ShareButton } from './ShareButton'
import { ReportButton } from './ReportButton'
import { DirectionsLink } from './DirectionsLink'
import { placeJsonLd } from './jsonLd'
import {
  PinIcon, WalletIcon, ClockIcon, TicketIcon, CardIcon, MetroIcon,
  AccessIcon, UmbrellaIcon, PhoneIcon, GlobeIcon, InstagramIcon, MenuIcon, StarIcon, Stars,
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
  WALK_IN: 'Sin reserva',
}
const RAIN_LABELS: Record<string, string> = {
  SUSPENDED: 'Si llueve se suspende',
  RELOCATED: 'Con lluvia se traslada a un espacio techado',
  CONTINUES: 'Funciona igual con lluvia',
}

const fmtCount = (n: number) => n.toLocaleString('es-CL')

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  let place: PlaceDetailView
  try {
    place = (await container.getGetPlaceBySlugUseCase().execute(slug)).place
  } catch {
    return { title: 'Lugar no encontrado' }
  }

  const title = `${place.name} · ${place.commune.name}`
  const description =
    place.description?.slice(0, 160) ??
    `${place.category.name} en ${place.neighborhood?.name ?? place.commune.name}, Santiago.`
  const path = `/lugar/${place.slug}`
  const cover = place.images.find((i) => i.isPrimary)?.url ?? place.images[0]?.url

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      title,
      description,
      url: path,
      images: cover ? [{ url: cover, alt: place.name }] : undefined,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  }
}

export default async function LugarPage({ params }: PageProps) {
  const { slug } = await params
  const session = await auth()
  const userId = session?.user?.id ?? undefined

  // La ficha pública y el contexto de guardado del usuario no dependen entre sí:
  // se traen en paralelo (el contexto solo si hay sesión).
  let place: PlaceDetailView
  let related: PlaceCardView[]
  let ctx: SaveContextOutput | null
  try {
    const [result, saveCtx] = await Promise.all([
      container.getGetPlaceBySlugUseCase().execute(slug),
      userId ? container.getGetSaveContextUseCase().execute(userId) : Promise.resolve(null),
    ])
    place = result.place
    related = result.related
    ctx = saveCtx
  } catch (error) {
    if (error instanceof PlaceNotFoundError) notFound()
    throw error
  }

  // Las listas del usuario + qué ya guardó alimentan el botón "Guardar".
  let collections: { id: string; name: string; itemCount: number }[] = []
  let defaultCollectionId: string | null = null
  let isSaved = false
  if (ctx) {
    collections = ctx.collections.map((c) => ({ id: c.id, name: c.name, itemCount: c.itemCount }))
    defaultCollectionId = ctx.defaultCollectionId
    isSaved = ctx.savedPlaceIds.includes(place.id)
  }

  // Combustible IA (post-MVP): registrar la visita del usuario logueado SIN bloquear
  // el render — corre después de enviar la respuesta (no suma latencia a la ficha).
  if (userId) {
    after(() => container.getRecordVisitUseCase().execute({ userId, placeId: place.id }))
  }

  const audience = place.tags.filter((t) => t.layer === 'AUDIENCE')
  const occasion = place.tags.filter((t) => t.layer === 'OCCASION')
  const vibe = place.tags.filter((t) => t.layer === 'VIBE')
  const experience = place.tags.filter((t) => t.layer === 'EXPERIENCE')
  const specific = place.tags.filter((t) => t.layer === 'SPECIFIC')
  const service = place.tags.filter((t) => t.layer === 'SERVICE')

  const hasContact = !!(
    place.phone || place.website || place.instagram || place.menuUrl || place.socialLinks.length
  )
  const hasAccess = !!(place.accessDetail || service.length)
  // "Cómo llegar": indicaciones a la ficha exacta del negocio. Con place_id de
  // Google apunta al lugar real (no a un punto geocodificado); si no, cae a la
  // dirección y, en último caso, a las coordenadas. Así siempre lleva AL lugar.
  const directionsHref = (() => {
    const base = 'https://www.google.com/maps/dir/?api=1'
    if (place.googlePlaceId) {
      const label = place.address ? `${place.name}, ${place.address}` : place.name
      return `${base}&destination=${encodeURIComponent(label)}&destination_place_id=${encodeURIComponent(place.googlePlaceId)}`
    }
    if (place.address) return `${base}&destination=${encodeURIComponent(place.address)}`
    if (place.lat != null && place.lng != null) return `${base}&destination=${place.lat},${place.lng}`
    return undefined
  })()

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

      {/* JSON-LD LocalBusiness: rich results de Google + lectura por LLMs (GEO/AEO). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd(place)) }}
      />

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

          {place.parent && (
            <Link href={`/lugar/${place.parent.slug}`} className="ficha__parent">
              Parte de {place.parent.name} ↗
            </Link>
          )}

          {place.brand && (
            <Link href={`/marca/${place.brand.slug}`} className="ficha__brand">
              {place.brand.logoUrl && (
                <Image
                  src={place.brand.logoUrl}
                  alt={place.brand.name}
                  width={20}
                  height={20}
                  className="ficha__brand-logo"
                />
              )}
              Por {place.brand.name} ↗
            </Link>
          )}

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
            <DirectionsLink href={directionsHref} placeId={place.id} placeName={place.name} />
          )}
          <ShareButton name={place.name} variant="button" />
        </div>

        {/* descripción + tags clave (los más útiles para decidir: con quién / ocasión) */}
        {(place.description || audience.length > 0 || occasion.length > 0) && (
          <div className="ficha__section">
            {place.description && <RichText text={place.description} className="ficha__lead" />}
            <TagGroup label="Con quién" tags={audience} />
            <TagGroup label="Ideal para" tags={occasion} />
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
              <DataRow icon={<AccessIcon />} k="Servicios y acceso">
                {place.accessDetail}
                {service.length > 0 && (
                  <div className="ficha__tags" style={{ marginTop: place.accessDetail ? 8 : 2 }}>
                    {service.map((t) => <span key={t.slug} className="chip">{t.name}</span>)}
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

        {/* ambiente y detalles (tags secundarios, tras los datos prácticos) */}
        {(vibe.length > 0 || experience.length > 0 || specific.length > 0) && (
          <div className="ficha__section">
            <h2 className="ficha__sec-h">Ambiente y detalles</h2>
            <TagGroup label="Vibe" tags={vibe} />
            <TagGroup label="Experiencia" tags={experience} />
            <TagGroup label="Lo que ofrece" tags={specific} />
          </div>
        )}

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
              {place.socialLinks.map((s) => (
                <ContactRow key={s.url} icon={<GlobeIcon />} k={s.network} v="Ver perfil" href={withProtocol(s.url)} />
              ))}
            </div>
          </div>
        )}

        {/* qué hay en este lugar (contenedor): hijos-con-ficha + spots sin ficha */}
        {(place.children.length > 0 || place.points.length > 0) && (
          <div className="ficha__section">
            <h2 className="ficha__sec-h">Qué hay en {place.name}</h2>
            {place.children.length > 0 && (
              <div className="ficha__children">
                {place.children.map((c) => (
                  <PlaceCard key={c.id} place={c} variant="list" />
                ))}
              </div>
            )}
            {place.points.length > 0 && <PointsList points={place.points} />}
          </div>
        )}

        {/* relacionados */}
        {related.length > 0 && (
          <div className="ficha__section">
            <h2 className="ficha__sec-h">También te puede gustar</h2>
            <PlaceRail scrollClassName="ficha__rel" className="rail-wrap--ficha">
              {related.map((r) => <RelCard key={r.id} place={r} />)}
            </PlaceRail>
          </div>
        )}

        {/* reportar */}
        <div className="ficha__report">
          <div className="ficha__report-hr" />
          <ReportButton placeId={place.id} />
        </div>
      </div>

      {/* barra de acción fija (móvil) — aparece al scrollear, no de entrada */}
      <StickyActionBar>
        {saveButton}
        {directionsHref && (
          <DirectionsLink href={directionsHref} placeId={place.id} placeName={place.name} block />
        )}
      </StickyActionBar>
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


function withProtocol(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`
}
function instagramHref(handle: string): string {
  if (/^https?:\/\//.test(handle)) return handle
  return `https://instagram.com/${handle.replace(/^@/, '')}`
}
