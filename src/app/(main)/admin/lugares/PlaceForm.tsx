'use client'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { PlaceFormOptions } from '@application/place/GetPlaceFormOptionsUseCase'
import type { PlaceEditView } from '@application/place/GetPlaceForEditUseCase'
import { ALLOWED_IMAGE_HOSTS } from '@lib/imageHosts'
import { PlacePreview } from './PlacePreview'
import {
  createPlaceAction,
  updatePlaceAction,
  uploadPlaceImageAction,
  importPlaceImageAction,
  publishPlaceAction,
  archivePlaceAction,
} from './actions'
import {
  PlaceFormValues,
  PAYMENT_OPTIONS,
  PRICE_OPTIONS,
  RESERVATION_OPTIONS,
  RAIN_OPTIONS,
  SOCIAL_NETWORK_OPTIONS,
  STATUS_LABELS,
  TAG_LAYER_LABELS,
  TAG_LAYER_ORDER,
} from './types'

const BLANK: PlaceFormValues = {
  name: '', description: '', menuUrl: '',
  categoryId: '', subcategoryId: '', secondaryCategoryId: '', secondarySubcategoryId: '',
  address: '', communeId: '', neighborhoodId: '', lat: '', lng: '', metroStationId: '',
  accessDetail: '', reference: '', rainPolicy: '',
  priceRange: '', reservation: '', paymentMethods: [], schedule: '',
  phone: '', website: '', instagram: '', socialLinks: [],
  googlePlaceId: '', googleRating: '', googleReviewCount: '',
  isPremium: false, parentId: '', brandId: '', tagIds: [], images: [], points: [],
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
    paymentMethods: [...p.paymentMethods],
    schedule: p.schedule ?? '',
    phone: p.phone ?? '',
    website: p.website ?? '',
    instagram: p.instagram ?? '',
    socialLinks: p.socialLinks.map((s) => ({ network: s.network, url: s.url })),
    googlePlaceId: p.googlePlaceId ?? '',
    googleRating: num(p.googleRating),
    googleReviewCount: num(p.googleReviewCount),
    isPremium: p.isPremium,
    parentId: p.parentId ?? '',
    brandId: p.brandId ?? '',
    tagIds: [...p.tagIds],
    images: p.images.map((img) => ({
      url: img.url,
      alt: img.alt ?? '',
      credit: img.credit ?? '',
      isPrimary: img.isPrimary,
    })),
    points: p.points.map((pt) => ({
      name: pt.name,
      description: pt.description ?? '',
      kind: pt.kind ?? '',
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
  const [showPreview, setShowPreview] = useState(false)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [importingIdx, setImportingIdx] = useState<number | null>(null)
  // Estado de publicación local (para mostrar Publicar/Archivar sin volver a la lista).
  const [status, setStatus] = useState(initial?.status ?? 'PENDING_REVIEW')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  function set<K extends keyof PlaceFormValues>(key: K, value: PlaceFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  // ── Opciones derivadas ──
  const primaryCat = options.categories.find((c) => c.id === values.categoryId)
  const subOptions = primaryCat?.subcategories ?? []
  // El menú/carta solo aplica a Gastronomía (un museo o parque no tiene carta).
  const isGastronomia = primaryCat?.slug === 'gastronomia'
  const secCat = options.categories.find((c) => c.id === values.secondaryCategoryId)
  const secSubOptions = secCat?.subcategories ?? []
  const neighborhoodOptions = values.communeId
    ? options.neighborhoods.filter((n) => n.communeIds.includes(values.communeId))
    : options.neighborhoods

  // Metro en 2 pasos: primero la línea, después la estación filtrada por esa línea.
  // La línea es solo ayuda de UI (no se guarda; la estación ya conoce sus líneas).
  const metroLines = useMemo(() => {
    const byCode = new Map<string, { code: string; color: string }>()
    for (const s of options.metroStations) for (const l of s.lines) byCode.set(l.code, l)
    return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code))
  }, [options.metroStations])
  const [metroLineCode, setMetroLineCode] = useState<string>(() => {
    const st = options.metroStations.find((s) => s.id === values.metroStationId)
    return st?.lines[0]?.code ?? ''
  })
  const stationsForLine = metroLineCode
    ? options.metroStations.filter((s) => s.lines.some((l) => l.code === metroLineCode))
    : []

  // Métodos de pago: chips multi-selección. Une las opciones base con cualquier
  // valor antiguo ya guardado, para no perderlo al editar.
  const paymentOptions = [...new Set<string>([...PAYMENT_OPTIONS, ...values.paymentMethods])]
  function togglePayment(method: string) {
    set('paymentMethods', values.paymentMethods.includes(method)
      ? values.paymentMethods.filter((m) => m !== method)
      : [...values.paymentMethods, method])
  }

  // Tags condicionales (ej. tipo de cocina) solo si su categoría = la principal.
  const visibleTags = options.tags.filter((t) => !t.categoryId || t.categoryId === values.categoryId)
  const tagGroups = TAG_LAYER_ORDER.map((layer) => ({
    layer,
    tags: visibleTags.filter((t) => t.layer === layer),
  })).filter((g) => g.tags.length > 0)
  // Topes por capa subjetiva (espejo del dominio). Las objetivas no topean.
  const LAYER_CAPS: Record<string, number> = { AUDIENCE: 4, OCCASION: 3, VIBE: 3 }
  const layerCount = (layer: string) =>
    values.tagIds.filter((id) =>
      options.tags.some((t) => t.id === id && t.layer === layer),
    ).length

  function toggleTag(id: string, layer: string) {
    const selected = values.tagIds.includes(id)
    const cap = LAYER_CAPS[layer]
    if (!selected && cap !== undefined && layerCount(layer) >= cap) return
    set('tagIds', selected ? values.tagIds.filter((t) => t !== id) : [...values.tagIds, id])
  }

  // ── Contenedor (padre) ──
  // Un lugar no puede ser su propio padre: en edición se excluye de la lista.
  const parentOptions = options.parents.filter((p) => p.id !== initial?.id)

  // ── Puntos (spots sin ficha) ──
  function addPoint() {
    setValues((v) => ({ ...v, points: [...v.points, { name: '', description: '', kind: '' }] }))
  }
  function updatePoint(i: number, field: 'name' | 'description' | 'kind', value: string) {
    setValues((v) => ({
      ...v,
      points: v.points.map((pt, idx) => (idx === i ? { ...pt, [field]: value } : pt)),
    }))
  }
  function removePoint(i: number) {
    setValues((v) => ({ ...v, points: v.points.filter((_, idx) => idx !== i) }))
  }

  // ── Redes sociales extra ──
  function addSocialLink() {
    setValues((v) => ({ ...v, socialLinks: [...v.socialLinks, { network: SOCIAL_NETWORK_OPTIONS[0], url: '' }] }))
  }
  function updateSocialLink(i: number, field: 'network' | 'url', value: string) {
    setValues((v) => ({
      ...v,
      socialLinks: v.socialLinks.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    }))
  }
  function removeSocialLink(i: number) {
    setValues((v) => ({ ...v, socialLinks: v.socialLinks.filter((_, idx) => idx !== i) }))
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
  // Sube el archivo elegido: la action lo comprime y lo guarda en Blob; la URL
  // resultante (ya de un host permitido) se vuelca en la fila.
  async function uploadImage(i: number, file: File) {
    setError(null)
    setUploadingIdx(i)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadPlaceImageAction(fd)
      if ('error' in res) setError(res.error)
      else updateImage(i, 'url', res.url)
    } finally {
      setUploadingIdx(null)
    }
  }
  // Trae una URL externa: la descarga, comprime y rehospeda en el Blob propio,
  // reemplazando el campo por la URL final (de un host permitido).
  async function importFromUrl(i: number) {
    const src = values.images[i]?.url.trim()
    if (!src) {
      setError('Pegá primero una URL en el campo de abajo.')
      return
    }
    setError(null)
    setImportingIdx(i)
    try {
      const res = await importPlaceImageAction(src)
      if ('error' in res) setError(res.error)
      else updateImage(i, 'url', res.url)
    } finally {
      setImportingIdx(null)
    }
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

  // Guarda los cambios actuales del form y luego publica (así no se pierden ediciones
  // sin guardar al publicar desde la revisión). Solo en edición.
  function handleSaveAndPublish() {
    setError(null)
    setSuccess(false)
    setStatusMsg(null)
    startTransition(async () => {
      const saved = await updatePlaceAction(initial!.id, values)
      if ('error' in saved) return setError(saved.error)
      const pub = await publishPlaceAction(initial!.id)
      if ('error' in pub) return setError(pub.error)
      setStatus('PUBLISHED')
      setStatusMsg('Guardado y publicado. Ya está visible en el sitio.')
    })
  }

  function handleArchive() {
    setError(null)
    setSuccess(false)
    setStatusMsg(null)
    startTransition(async () => {
      const res = await archivePlaceAction(initial!.id)
      if ('error' in res) return setError(res.error)
      setStatus('ARCHIVED')
      setStatusMsg('Lugar archivado (ya no se muestra en el sitio).')
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
      </section>

      {/* ── Categorización ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Categorización</h3>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="categoryId">Categoría *</label>
            <select id="categoryId" className="form-input" value={values.categoryId} required
              onChange={(e) => {
                const categoryId = e.target.value
                const gastro = options.categories.find((c) => c.id === categoryId)?.slug === 'gastronomia'
                // Al salir de Gastronomía, descartamos el menú (no aplica a museos/parques).
                setValues((v) => ({ ...v, categoryId, subcategoryId: '', menuUrl: gastro ? v.menuUrl : '' }))
              }}>
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
            <label className="form-label" htmlFor="metroLine">Línea de metro</label>
            <select id="metroLine" className="form-input" value={metroLineCode}
              onChange={(e) => {
                const code = e.target.value
                setMetroLineCode(code)
                // Si la estación ya elegida no está en la nueva línea, se limpia.
                const stillValid = options.metroStations.some(
                  (s) => s.id === values.metroStationId && s.lines.some((l) => l.code === code),
                )
                if (!stillValid) set('metroStationId', '')
              }}>
              <option value="">— Ninguna —</option>
              {metroLines.map((l) => (
                <option key={l.code} value={l.code}>Línea {l.code.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="metroStationId">Estación</label>
            <select id="metroStationId" className="form-input" value={values.metroStationId}
              disabled={!metroLineCode}
              onChange={(e) => set('metroStationId', e.target.value)}>
              <option value="">{metroLineCode ? '— Elegí la estación —' : '— Elegí la línea primero —'}</option>
              {stationsForLine.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="rainPolicy">Si llueve (aire libre)</label>
          <select id="rainPolicy" className="form-input" value={values.rainPolicy}
            onChange={(e) => set('rainPolicy', e.target.value)}>
            <option value="">— No aplica —</option>
            {RAIN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
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
        {isGastronomia && (
          <div className="form-row">
            <label className="form-label" htmlFor="menuUrl">URL del menú / carta</label>
            <input id="menuUrl" className="form-input" type="url" placeholder="https://…"
              value={values.menuUrl} onChange={(e) => set('menuUrl', e.target.value)} />
          </div>
        )}
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
          <span className="form-label">Métodos de pago</span>
          <div className="chip-set">
            {paymentOptions.map((opt) => {
              const on = values.paymentMethods.includes(opt)
              return (
                <button key={opt} type="button" className="chip" aria-pressed={on}
                  onClick={() => togglePayment(opt)}>
                  {opt}
                </button>
              )
            })}
          </div>
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

        <div className="form-row">
          <span className="form-label">Otras redes</span>
          <p className="admin-form__hint">
            WhatsApp, Facebook, TikTok, etc. Instagram va en su campo de arriba.
          </p>
          {values.socialLinks.map((s, i) => (
            <div key={i} className="admin-img-row">
              <div className="admin-img-row__meta">
                <div className="form-row">
                  <label className="form-label" htmlFor={`social-net-${i}`}>Red</label>
                  <select id={`social-net-${i}`} className="form-input" value={s.network}
                    onChange={(e) => updateSocialLink(i, 'network', e.target.value)}>
                    {SOCIAL_NETWORK_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor={`social-url-${i}`}>URL</label>
                  <input id={`social-url-${i}`} className="form-input" type="url" value={s.url}
                    onChange={(e) => updateSocialLink(i, 'url', e.target.value)} placeholder="https://…" />
                </div>
              </div>
              <div className="admin-img-row__foot">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeSocialLink(i)}>
                  Quitar
                </button>
              </div>
            </div>
          ))}
          <div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={addSocialLink}>
              + Agregar red
            </button>
          </div>
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
          Subí la foto (se comprime sola), o pegá una URL de cualquier sitio y tocá
          <strong> Traer</strong> para copiarla a tu almacenamiento. Solo se guardan URLs
          de hosts permitidos ({ALLOWED_IMAGE_HOSTS.join(' · ')}).
        </p>
        {values.images.map((img, i) => (
          <div key={i} className="admin-img-row">
            {img.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="admin-img-row__thumb" src={img.url} alt="" />
            )}
            <div className="form-row">
              <label className="form-label" htmlFor={`img-file-${i}`}>Foto</label>
              <label className="btn btn--ghost btn--sm admin-img-row__upload">
                <input id={`img-file-${i}`} type="file" accept="image/*" hidden
                  disabled={uploadingIdx !== null}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void uploadImage(i, f)
                    e.target.value = '' // permite re-subir el mismo archivo
                  }} />
                {uploadingIdx === i ? 'Subiendo…' : img.url ? 'Cambiar foto' : 'Subir foto'}
              </label>
            </div>
            <div className="form-row">
              <label className="form-label" htmlFor={`img-url-${i}`}>o pegá una URL</label>
              <div className="admin-img-row__url">
                <input id={`img-url-${i}`} className="form-input" type="url" value={img.url}
                  onChange={(e) => updateImage(i, 'url', e.target.value)} placeholder="https://…" />
                <button type="button" className="btn btn--ghost btn--sm"
                  disabled={importingIdx !== null || !img.url.trim()}
                  onClick={() => void importFromUrl(i)}>
                  {importingIdx === i ? 'Trayendo…' : 'Traer'}
                </button>
              </div>
            </div>
            <div className="admin-img-row__meta">
              <div className="form-row">
                <label className="form-label" htmlFor={`img-alt-${i}`}>Texto alternativo</label>
                <input id={`img-alt-${i}`} className="form-input" value={img.alt}
                  onChange={(e) => updateImage(i, 'alt', e.target.value)} />
              </div>
              <div className="form-row">
                <label className="form-label" htmlFor={`img-credit-${i}`}>Crédito</label>
                <input id={`img-credit-${i}`} className="form-input" value={img.credit}
                  onChange={(e) => updateImage(i, 'credit', e.target.value)} />
              </div>
            </div>
            <div className="admin-img-row__foot">
              <label className="admin-img-row__primary">
                <input type="radio" name="primaryImage" checked={img.isPrimary}
                  onChange={() => setPrimaryImage(i)} />
                Portada
              </label>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeImage(i)}>
                Quitar
              </button>
            </div>
          </div>
        ))}
        <div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addImage}>
            + Agregar imagen
          </button>
        </div>
      </section>

      {/* ── Contenedor: padre + spots sin ficha ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Lugar contenedor</h3>
        <div className="form-row">
          <label className="form-label" htmlFor="parentId">Pertenece a un lugar mayor</label>
          <select id="parentId" className="form-input" value={values.parentId}
            onChange={(e) => set('parentId', e.target.value)}>
            <option value="">— Ninguno (es un lugar independiente) —</option>
            {parentOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <p className="admin-form__hint">
            Ej.: el Zoológico pertenece a Parquemet. Solo un nivel; no podés elegir un lugar que ya
            cuelga de este.
          </p>
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="brandId">Marca / Negocio</label>
          <select id="brandId" className="form-input" value={values.brandId}
            onChange={(e) => set('brandId', e.target.value)}>
            <option value="">— Sin marca (local independiente) —</option>
            {options.brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <p className="admin-form__hint">
            Si es una sucursal de una cadena (ej.: Emporio La Rosa), elegí su marca. ¿No está?
            Creala primero en <a href="/admin/marcas/nuevo" target="_blank" rel="noopener noreferrer">Marcas</a>.
          </p>
        </div>

        <div className="form-row">
          <span className="form-label">Qué hay acá (puntos sin ficha)</span>
          <p className="admin-form__hint">
            Miradores, kioscos, “el local donde venden X”: se listan como texto en la ficha, sin
            ficha propia ni filtro.
          </p>
          {values.points.map((pt, i) => (
            <div key={i} className="admin-img-row">
              <div className="form-row">
                <label className="form-label" htmlFor={`pt-name-${i}`}>Nombre *</label>
                <input id={`pt-name-${i}`} className="form-input" value={pt.name}
                  onChange={(e) => updatePoint(i, 'name', e.target.value)} placeholder="Mirador Pío Nono" />
              </div>
              <div className="admin-img-row__meta">
                <div className="form-row">
                  <label className="form-label" htmlFor={`pt-desc-${i}`}>Descripción</label>
                  <input id={`pt-desc-${i}`} className="form-input" value={pt.description}
                    onChange={(e) => updatePoint(i, 'description', e.target.value)} />
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor={`pt-kind-${i}`}>Tipo (opcional)</label>
                  <input id={`pt-kind-${i}`} className="form-input" value={pt.kind}
                    onChange={(e) => updatePoint(i, 'kind', e.target.value)} placeholder="mirador" />
                </div>
              </div>
              <div className="admin-img-row__foot">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => removePoint(i)}>
                  Quitar
                </button>
              </div>
            </div>
          ))}
          <div>
            <button type="button" className="btn btn--ghost btn--sm" onClick={addPoint}>
              + Agregar punto
            </button>
          </div>
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
      {statusMsg && <p role="status" className="admin-form__success">{statusMsg}</p>}

      <div className="admin-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear lugar'}
        </button>

        {mode === 'edit' && status !== 'PUBLISHED' && (
          <button type="button" className="btn btn--primary" disabled={isPending}
            onClick={handleSaveAndPublish}>
            Guardar y publicar
          </button>
        )}
        {mode === 'edit' && status === 'PUBLISHED' && (
          <button type="button" className="btn btn--ghost" disabled={isPending}
            onClick={handleArchive}>
            Archivar
          </button>
        )}

        <button type="button" className="btn btn--ghost" onClick={() => setShowPreview(true)}>
          Vista previa
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => router.push('/admin/lugares')}>
          Volver a la lista
        </button>
      </div>
      {mode === 'edit' && (
        <p className="admin-form__hint" style={{ marginTop: 'var(--s-2)' }}>
          Estado actual: <strong>{STATUS_LABELS[status] ?? status}</strong>
        </p>
      )}

      {showPreview && (
        <PlacePreview values={values} options={options} onClose={() => setShowPreview(false)} />
      )}
    </form>
  )
}
