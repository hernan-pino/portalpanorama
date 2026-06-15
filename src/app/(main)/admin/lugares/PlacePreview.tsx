'use client'
import { useEffect, useMemo } from 'react'
import type { PlaceFormOptions } from '@application/place/GetPlaceFormOptionsUseCase'
import type { PlaceFormValues } from './types'
import { PRICE_OPTIONS, RESERVATION_OPTIONS, RAIN_OPTIONS } from './types'
import {
  PinIcon, WalletIcon, ClockIcon, TicketIcon, CardIcon, MetroIcon,
  AccessIcon, UmbrellaIcon, PhoneIcon, GlobeIcon, InstagramIcon, MenuIcon, Stars,
} from '@/app/(main)/lugar/[slug]/icons'
import { PointsList } from '@/app/(main)/lugar/[slug]/PointsList'

// Vista previa de la ficha con los valores actuales del form, antes de guardar.
// Reusa las clases `.ficha` reales para verse igual que la página pública, pero
// resuelve los ids a nombres desde las `options` que ya tiene el form (no toca BD)
// y usa <img> plano en vez de next/image: en preview la URL puede ser de un host
// fuera de la allowlist y no queremos que reviente el render mientras se prueba.

const PRICE_LABELS = Object.fromEntries(PRICE_OPTIONS.map((o) => [o.value, o.label]))
const PRICE_ORDER = PRICE_OPTIONS.map((o) => o.value)
const RESERVATION_LABELS = Object.fromEntries(RESERVATION_OPTIONS.map((o) => [o.value, o.label]))
const RAIN_LABELS = Object.fromEntries(RAIN_OPTIONS.map((o) => [o.value, o.label]))

const fmtCount = (n: number) => n.toLocaleString('es-CL')

interface PlacePreviewProps {
  values: PlaceFormValues
  options: PlaceFormOptions
  onClose: () => void
}

export function PlacePreview({ values, options, onClose }: PlacePreviewProps) {
  // Cerrar con Escape (cierra el rol dialog como cualquier modal del sitio).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const v = useMemo(() => {
    const cat = options.categories.find((c) => c.id === values.categoryId)
    const sub = cat?.subcategories.find((s) => s.id === values.subcategoryId)
    const secCat = options.categories.find((c) => c.id === values.secondaryCategoryId)
    const commune = options.communes.find((c) => c.id === values.communeId)
    const neighborhood = options.neighborhoods.find((n) => n.id === values.neighborhoodId)
    const metro = options.metroStations.find((m) => m.id === values.metroStationId)
    const parent = options.parents.find((p) => p.id === values.parentId)

    const tagsById = new Map(options.tags.map((t) => [t.id, t]))
    const selectedTags = values.tagIds.map((id) => tagsById.get(id)).filter(Boolean) as typeof options.tags
    const byLayer = (layer: string) => selectedTags.filter((t) => t.layer === layer)

    const rating = values.googleRating ? Number(values.googleRating) : NaN
    const reviews = values.googleReviewCount ? Number(values.googleReviewCount) : NaN

    const images = values.images.length
      ? [...values.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
      : []

    return {
      categoryName: cat?.name,
      subcategoryName: sub?.name,
      secondaryCategoryName: secCat && secCat.id !== cat?.id ? secCat.name : undefined,
      communeName: commune?.name,
      neighborhoodName: neighborhood?.name,
      metro,
      parentName: parent?.name,
      audience: byLayer('AUDIENCE'),
      occasion: byLayer('OCCASION'),
      vibe: byLayer('VIBE'),
      experience: byLayer('EXPERIENCE'),
      specific: byLayer('SPECIFIC'),
      service: byLayer('SERVICE'),
      rating: Number.isFinite(rating) ? rating : undefined,
      reviews: Number.isFinite(reviews) ? reviews : undefined,
      cover: images[0],
      paymentMethods: values.paymentMethods,
    }
  }, [values, options])

  const directionsHref = values.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(values.address)}`
    : undefined
  const hasContact = !!(
    values.phone || values.website || values.instagram || values.menuUrl || values.socialLinks.length
  )
  const hasAccess = !!(values.accessDetail || v.service.length)

  return (
    <div className="preview-scrim" role="dialog" aria-modal="true" aria-label="Vista previa de la ficha"
      onClick={onClose}>
      <div className="preview-panel" onClick={(e) => e.stopPropagation()}>
        <div className="preview-bar">
          <span className="preview-bar__tag">Vista previa — no se guarda nada</span>
          <button type="button" className="preview-bar__close" onClick={onClose} aria-label="Cerrar vista previa">
            ×
          </button>
        </div>

        <div className="ficha">
          {/* hero */}
          {v.cover ? (
            <div className="ficha__hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ficha__hero-img" src={v.cover.url} alt={v.cover.alt || values.name}
                style={{ objectFit: 'cover' }} />
            </div>
          ) : (
            <div className="ficha__hero">
              <div className="ficha__hero-img placeholder-stripe" />
            </div>
          )}

          <div className="ficha__sheet">
            {/* encabezado */}
            <div className="ficha__head">
              <div className="ficha__cats">
                {v.categoryName && <span className="chip chip--accent">{v.categoryName}</span>}
                {v.subcategoryName && <span className="chip">{v.subcategoryName}</span>}
                {v.secondaryCategoryName && <span className="chip">{v.secondaryCategoryName}</span>}
              </div>

              <h1 className="ficha__title">{values.name || 'Sin nombre'}</h1>

              {(v.neighborhoodName || v.communeName) && (
                <div className="ficha__loc">
                  <PinIcon />
                  <span>{v.neighborhoodName ? `${v.neighborhoodName} · ` : ''}{v.communeName}</span>
                </div>
              )}

              {v.parentName && <p className="ficha__parent">Parte de {v.parentName} ↗</p>}

              {v.rating != null && (
                <div className="ficha__rating">
                  <Stars value={v.rating} />
                  <span className="num">{v.rating.toFixed(1)}</span>
                  {v.reviews != null && <span>({fmtCount(v.reviews)}) · Google</span>}
                </div>
              )}
            </div>

            {/* descripción + tags clave (con quién / ocasión) */}
            {(values.description || v.audience.length || v.occasion.length) ? (
              <div className="ficha__section">
                {values.description && <p className="ficha__lead">{values.description}</p>}
                <TagGroup label="Con quién" tags={v.audience} />
                <TagGroup label="Ideal para" tags={v.occasion} />
              </div>
            ) : null}

            {/* datos prácticos */}
            <div className="ficha__section">
              <h2 className="ficha__sec-h">Datos prácticos</h2>
              <div className="ficha__card">
                {values.priceRange && (
                  <DataRow icon={<WalletIcon />} k="Precio"><PriceScale value={values.priceRange} /></DataRow>
                )}
                {values.schedule && <DataRow icon={<ClockIcon />} k="Horario">{values.schedule}</DataRow>}
                {values.reservation && (
                  <DataRow icon={<TicketIcon />} k="Reserva">
                    {RESERVATION_LABELS[values.reservation] ?? values.reservation}
                  </DataRow>
                )}
                {v.paymentMethods.length > 0 && (
                  <DataRow icon={<CardIcon />} k="Pagos">
                    <div className="ficha__tags" style={{ marginTop: 2 }}>
                      {v.paymentMethods.map((m) => <span key={m} className="chip">{m}</span>)}
                    </div>
                  </DataRow>
                )}
                {v.metro && (
                  <DataRow icon={<MetroIcon />} k="Metro">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--s-2)' }}>
                      {v.metro.name}
                      <span className="ficha__metro-lines">
                        {v.metro.lines.map((l) => (
                          <span key={l.code} className="ficha__metro-line" style={{ background: l.color }}>{l.code}</span>
                        ))}
                      </span>
                    </span>
                  </DataRow>
                )}
                {hasAccess && (
                  <DataRow icon={<AccessIcon />} k="Servicios y acceso">
                    {values.accessDetail}
                    {v.service.length > 0 && (
                      <div className="ficha__tags" style={{ marginTop: values.accessDetail ? 8 : 2 }}>
                        {v.service.map((t) => <span key={t.id} className="chip">{t.name}</span>)}
                      </div>
                    )}
                  </DataRow>
                )}
                {values.reference && <DataRow icon={<PinIcon />} k="Cómo ubicarlo">{values.reference}</DataRow>}
                {values.rainPolicy && (
                  <DataRow icon={<UmbrellaIcon />} k="Si llueve">
                    {RAIN_LABELS[values.rainPolicy] ?? values.rainPolicy}
                  </DataRow>
                )}
              </div>
            </div>

            {/* ambiente y detalles (tags secundarios, tras los datos prácticos) */}
            {(v.vibe.length || v.experience.length || v.specific.length) ? (
              <div className="ficha__section">
                <h2 className="ficha__sec-h">Ambiente y detalles</h2>
                <TagGroup label="Vibe" tags={v.vibe} />
                <TagGroup label="Experiencia" tags={v.experience} />
                <TagGroup label="Lo que ofrece" tags={v.specific} />
              </div>
            ) : null}

            {/* contacto */}
            {hasContact && (
              <div className="ficha__section">
                <h2 className="ficha__sec-h">Contacto</h2>
                <div className="ficha__contact">
                  {values.phone && <ContactRow icon={<PhoneIcon />} k="Teléfono" v={values.phone} />}
                  {values.website && <ContactRow icon={<GlobeIcon />} k="Sitio web" v={values.website} />}
                  {values.instagram && <ContactRow icon={<InstagramIcon />} k="Instagram" v={values.instagram} />}
                  {values.menuUrl && <ContactRow icon={<MenuIcon />} k="Menú" v="Ver la carta" />}
                  {values.socialLinks.map((s, i) => (
                    <ContactRow key={i} icon={<GlobeIcon />} k={s.network} v="Ver perfil" />
                  ))}
                </div>
              </div>
            )}

            {/* qué hay acá (spots sin ficha) */}
            {values.points.length > 0 && (
              <div className="ficha__section">
                <h2 className="ficha__sec-h">Qué hay en {values.name || 'este lugar'}</h2>
                <PointsList points={values.points} />
              </div>
            )}

            {directionsHref && (
              <p className="admin-form__hint" style={{ marginTop: 'var(--s-4)' }}>
                Botón “Cómo llegar” activo (dirección cargada).
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Subcomponentes (espejo de los de la ficha pública, sin enlaces externos) ── */

function TagGroup({ label, tags }: { label: string; tags: { id: string; name: string }[] }) {
  if (tags.length === 0) return null
  return (
    <div className="ficha__taggroup">
      <div className="ficha__taglabel">{label}</div>
      <div className="ficha__tags">
        {tags.map((t) => <span key={t.id} className="chip">{t.name}</span>)}
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

// En preview el contacto no enlaza a ningún lado: solo muestra el dato tal cual.
function ContactRow({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="ficha__crow">
      <span className="ci">{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span className="ck">{k}</span>
        <span className="cv">{v}</span>
      </span>
    </div>
  )
}
