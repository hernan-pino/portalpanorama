'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { PlaceFormOptions } from '@application/place/GetPlaceFormOptionsUseCase'
import type { PlaceEditView } from '@application/place/GetPlaceForEditUseCase'
import { ALLOWED_IMAGE_HOSTS } from '@lib/imageHosts'
import { createPlaceAction, updatePlaceAction } from './actions'
import {
  PlaceFormValues,
  PRICE_OPTIONS,
  RESERVATION_OPTIONS,
  RAIN_OPTIONS,
  TAG_LAYER_LABELS,
  TAG_LAYER_ORDER,
} from './types'

const BLANK: PlaceFormValues = {
  name: '', description: '', menuUrl: '',
  categoryId: '', subcategoryId: '', secondaryCategoryId: '', secondarySubcategoryId: '',
  address: '', communeId: '', neighborhoodId: '', lat: '', lng: '', metroStationId: '',
  accessDetail: '', reference: '', rainPolicy: '',
  priceRange: '', reservation: '', paymentMethods: '', schedule: '',
  phone: '', website: '', instagram: '',
  googlePlaceId: '', googleRating: '', googleReviewCount: '',
  isPremium: false, tagIds: [], images: [],
}

function fromInitial(p: PlaceEditView): PlaceFormValues {
  const num = (n?: number) => (n != null ? String(n) : '')
  return {
    name: p.name,
    description: p.description ?? '',
    menuUrl: p.menuUrl ?? '',
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    secondaryCategoryId: p.secondaryCategoryId ?? '',
    secondarySubcategoryId: p.secondarySubcategoryId ?? '',
    address: p.address ?? '',
    communeId: p.communeId,
    neighborhoodId: p.neighborhoodId ?? '',
    lat: num(p.lat),
    lng: num(p.lng),
    metroStationId: p.metroStationId ?? '',
    accessDetail: p.accessDetail ?? '',
    reference: p.reference ?? '',
    rainPolicy: p.rainPolicy ?? '',
    priceRange: p.priceRange ?? '',
    reservation: p.reservation ?? '',
    paymentMethods: p.paymentMethods.join(', '),
    schedule: p.schedule ?? '',
    phone: p.phone ?? '',
    website: p.website ?? '',
    instagram: p.instagram ?? '',
    googlePlaceId: p.googlePlaceId ?? '',
    googleRating: num(p.googleRating),
    googleReviewCount: num(p.googleReviewCount),
    isPremium: p.isPremium,
    tagIds: [...p.tagIds],
    images: p.images.map((img) => ({
      url: img.url,
      alt: img.alt ?? '',
      credit: img.credit ?? '',
      isPrimary: img.isPrimary,
    })),
  }
}

interface PlaceFormProps {
  options: PlaceFormOptions
  initial?: PlaceEditView
}

export function PlaceForm({ options, initial }: PlaceFormProps) {
  const router = useRouter()
  const mode = initial ? 'edit' : 'create'
  const [values, setValues] = useState<PlaceFormValues>(initial ? fromInitial(initial) : BLANK)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function set<K extends keyof PlaceFormValues>(key: K, value: PlaceFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  // ── Opciones derivadas ──
  const primaryCat = options.categories.find((c) => c.id === values.categoryId)
  const subOptions = primaryCat?.subcategories ?? []
  const secCat = options.categories.find((c) => c.id === values.secondaryCategoryId)
  const secSubOptions = secCat?.subcategories ?? []
  const neighborhoodOptions = values.communeId
    ? options.neighborhoods.filter((n) => n.communeIds.includes(values.communeId))
    : options.neighborhoods

  // Tags condicionales (ej. tipo de cocina) solo si su categoría = la principal.
  const visibleTags = options.tags.filter((t) => !t.categoryId || t.categoryId === values.categoryId)
  const tagGroups = TAG_LAYER_ORDER.map((layer) => ({
    layer,
    tags: visibleTags.filter((t) => t.layer === layer),
  })).filter((g) => g.tags.length > 0)
  const socialCount = values.tagIds.filter((id) =>
    options.tags.some((t) => t.id === id && t.layer === 'SOCIAL'),
  ).length
  const vibeCount = values.tagIds.filter((id) =>
    options.tags.some((t) => t.id === id && t.layer === 'VIBE'),
  ).length

  function toggleTag(id: string, layer: string) {
    const selected = values.tagIds.includes(id)
    if (!selected && layer === 'SOCIAL' && socialCount >= 4) return
    if (!selected && layer === 'VIBE' && vibeCount >= 3) return
    set('tagIds', selected ? values.tagIds.filter((t) => t !== id) : [...values.tagIds, id])
  }

  // ── Imágenes ──
  function addImage() {
    setValues((v) => ({
      ...v,
      images: [...v.images, { url: '', alt: '', credit: '', isPrimary: v.images.length === 0 }],
    }))
  }
  function updateImage(i: number, field: 'url' | 'alt' | 'credit', value: string) {
    setValues((v) => ({
      ...v,
      images: v.images.map((img, idx) => (idx === i ? { ...img, [field]: value } : img)),
    }))
  }
  function setPrimaryImage(i: number) {
    setValues((v) => ({ ...v, images: v.images.map((img, idx) => ({ ...img, isPrimary: idx === i })) }))
  }
  function removeImage(i: number) {
    setValues((v) => {
      let images = v.images.filter((_, idx) => idx !== i)
      // si se borró la primaria, asciende la primera (sin mutar el estado previo)
      if (images.length > 0 && !images.some((img) => img.isPrimary)) {
        images = images.map((img, idx) => (idx === 0 ? { ...img, isPrimary: true } : img))
      }
      return { ...v, images }
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result =
        mode === 'edit'
          ? await updatePlaceAction(initial!.id, values)
          : await createPlaceAction(values)
      if ('error' in result) {
        setError(result.error)
        return
      }
      if (mode === 'create') router.push('/admin/lugares')
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {/* ── Básicos ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Datos básicos</h3>
        <div className="form-row">
          <label className="form-label" htmlFor="name">Nombre *</label>
          <input id="name" className="form-input" value={values.name}
            onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="description">Descripción</label>
          <textarea id="description" className="form-input" rows={4} value={values.description}
            onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="menuUrl">URL del menú / carta</label>
          <input id="menuUrl" className="form-input" type="url" placeholder="https://…"
            value={values.menuUrl} onChange={(e) => set('menuUrl', e.target.value)} />
        </div>
      </section>

      {/* ── Categorización ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Categorización</h3>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="categoryId">Categoría *</label>
            <select id="categoryId" className="form-input" value={values.categoryId} required
              onChange={(e) => setValues((v) => ({ ...v, categoryId: e.target.value, subcategoryId: '' }))}>
              <option value="">— Elegí —</option>
              {options.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="subcategoryId">Subcategoría *</label>
            <select id="subcategoryId" className="form-input" value={values.subcategoryId} required
              disabled={!values.categoryId}
              onChange={(e) => set('subcategoryId', e.target.value)}>
              <option value="">— Elegí —</option>
              {subOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="secondaryCategoryId">Categoría secundaria</label>
            <select id="secondaryCategoryId" className="form-input" value={values.secondaryCategoryId}
              onChange={(e) => setValues((v) => ({ ...v, secondaryCategoryId: e.target.value, secondarySubcategoryId: '' }))}>
              <option value="">— Ninguna —</option>
              {options.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="secondarySubcategoryId">Subcategoría secundaria</label>
            <select id="secondarySubcategoryId" className="form-input" value={values.secondarySubcategoryId}
              disabled={!values.secondaryCategoryId}
              onChange={(e) => set('secondarySubcategoryId', e.target.value)}>
              <option value="">— Elegí —</option>
              {secSubOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* ── Ubicación ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Ubicación</h3>
        <div className="form-row">
          <label className="form-label" htmlFor="address">Dirección</label>
          <input id="address" className="form-input" value={values.address}
            onChange={(e) => set('address', e.target.value)} placeholder="Calle 123, Comuna" />
        </div>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="communeId">Comuna *</label>
            <select id="communeId" className="form-input" value={values.communeId} required
              onChange={(e) => setValues((v) => ({ ...v, communeId: e.target.value, neighborhoodId: '' }))}>
              <option value="">— Elegí —</option>
              {options.communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="neighborhoodId">Barrio</label>
            <select id="neighborhoodId" className="form-input" value={values.neighborhoodId}
              onChange={(e) => set('neighborhoodId', e.target.value)}>
              <option value="">— Ninguno —</option>
              {neighborhoodOptions.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="metroStationId">Estación de metro</label>
            <select id="metroStationId" className="form-input" value={values.metroStationId}
              onChange={(e) => set('metroStationId', e.target.value)}>
              <option value="">— Ninguna —</option>
              {options.metroStations.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.lines.length ? ` (${m.lines.map((l) => l.code).join(', ')})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="rainPolicy">Si llueve (aire libre)</label>
            <select id="rainPolicy" className="form-input" value={values.rainPolicy}
              onChange={(e) => set('rainPolicy', e.target.value)}>
              <option value="">— No aplica —</option>
              {RAIN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="lat">Latitud</label>
            <input id="lat" className="form-input" inputMode="decimal" value={values.lat}
              onChange={(e) => set('lat', e.target.value)} placeholder="-33.4264" />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="lng">Longitud</label>
            <input id="lng" className="form-input" inputMode="decimal" value={values.lng}
              onChange={(e) => set('lng', e.target.value)} placeholder="-70.6200" />
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="accessDetail">Detalle de acceso</label>
            <input id="accessDetail" className="form-input" value={values.accessDetail}
              onChange={(e) => set('accessDetail', e.target.value)} placeholder="Entrada por Espacio B, 2° piso" />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="reference">Referencia</label>
            <input id="reference" className="form-input" value={values.reference}
              onChange={(e) => set('reference', e.target.value)} placeholder="frente al Jumbo" />
          </div>
        </div>
      </section>

      {/* ── Operacional ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Presupuesto y operación</h3>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="priceRange">Rango de precio</label>
            <select id="priceRange" className="form-input" value={values.priceRange}
              onChange={(e) => set('priceRange', e.target.value)}>
              <option value="">— Sin definir —</option>
              {PRICE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="reservation">Reserva</label>
            <select id="reservation" className="form-input" value={values.reservation}
              onChange={(e) => set('reservation', e.target.value)}>
              <option value="">— Sin definir —</option>
              {RESERVATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="paymentMethods">Métodos de pago</label>
          <input id="paymentMethods" className="form-input" value={values.paymentMethods}
            onChange={(e) => set('paymentMethods', e.target.value)} placeholder="Efectivo, Débito, Crédito" />
          <p className="admin-form__hint">Separados por coma.</p>
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="schedule">Horario</label>
          <textarea id="schedule" className="form-input" rows={3} value={values.schedule}
            onChange={(e) => set('schedule', e.target.value)} placeholder="Lun a Vie 9–18h…" />
        </div>
      </section>

      {/* ── Contacto ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Contacto y redes</h3>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="phone">Teléfono</label>
            <input id="phone" className="form-input" value={values.phone}
              onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="website">Sitio web</label>
            <input id="website" className="form-input" type="url" placeholder="https://…"
              value={values.website} onChange={(e) => set('website', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="instagram">Instagram</label>
          <input id="instagram" className="form-input" value={values.instagram}
            onChange={(e) => set('instagram', e.target.value)} placeholder="@cuenta" />
        </div>
      </section>

      {/* ── Reputación Google ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Reputación de Google</h3>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="googleRating">Estrellas (1–5)</label>
            <input id="googleRating" className="form-input" inputMode="decimal" value={values.googleRating}
              onChange={(e) => set('googleRating', e.target.value)} placeholder="4.6" />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="googleReviewCount">N° de reseñas</label>
            <input id="googleReviewCount" className="form-input" inputMode="numeric" value={values.googleReviewCount}
              onChange={(e) => set('googleReviewCount', e.target.value)} placeholder="1240" />
          </div>
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="googlePlaceId">Google Place ID</label>
          <input id="googlePlaceId" className="form-input" value={values.googlePlaceId}
            onChange={(e) => set('googlePlaceId', e.target.value)} />
        </div>
      </section>

      {/* ── Tags ── */}
      {tagGroups.length > 0 && (
        <section className="admin-form__section">
          <h3 className="admin-form__legend">Tags</h3>
          {tagGroups.map((g) => (
            <div key={g.layer} className="form-row">
              <span className="form-label">{TAG_LAYER_LABELS[g.layer] ?? g.layer}</span>
              <div className="chip-set">
                {g.tags.map((t) => {
                  const on = values.tagIds.includes(t.id)
                  return (
                    <button key={t.id} type="button" className="chip"
                      aria-pressed={on} onClick={() => toggleTag(t.id, t.layer)}>
                      {t.name}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Imágenes ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Imágenes</h3>
        <p className="admin-form__hint">
          Solo URLs https de hosts permitidos: {ALLOWED_IMAGE_HOSTS.join(' · ')}. Otro host
          rompe la ficha al renderizar.
        </p>
        {values.images.map((img, i) => (
          <div key={i} className="admin-img-row">
            <div className="form-row" style={{ flex: 1 }}>
              <label className="form-label" htmlFor={`img-url-${i}`}>URL *</label>
              <input id={`img-url-${i}`} className="form-input" type="url" value={img.url}
                onChange={(e) => updateImage(i, 'url', e.target.value)} placeholder="https://…" />
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor={`img-alt-${i}`}>Alt</label>
              <input id={`img-alt-${i}`} className="form-input" value={img.alt}
                onChange={(e) => updateImage(i, 'alt', e.target.value)} />
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor={`img-credit-${i}`}>Crédito</label>
              <input id={`img-credit-${i}`} className="form-input" value={img.credit}
                onChange={(e) => updateImage(i, 'credit', e.target.value)} />
            </div>
            <label className="admin-img-row__primary">
              <input type="radio" name="primaryImage" checked={img.isPrimary}
                onChange={() => setPrimaryImage(i)} />
              Portada
            </label>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeImage(i)}>
              Quitar
            </button>
          </div>
        ))}
        <div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addImage}>
            + Agregar imagen
          </button>
        </div>
      </section>

      {/* ── Premium ── */}
      <section className="admin-form__section">
        <label className="admin-form__check">
          <input type="checkbox" checked={values.isPremium}
            onChange={(e) => set('isPremium', e.target.checked)} />
          Marcar como premium (posicionamiento, post-MVP)
        </label>
      </section>

      {error && <p role="alert" className="form-error-banner">{error}</p>}
      {success && (
        <p role="status" className="admin-form__success">Cambios guardados correctamente.</p>
      )}

      <div className="admin-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear lugar'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => router.push('/admin/lugares')}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
