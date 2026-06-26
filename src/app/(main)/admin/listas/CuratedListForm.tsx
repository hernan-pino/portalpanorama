'use client'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ALLOWED_IMAGE_HOSTS } from '@lib/imageHosts'
import type { PlaceFacets, FacetCount } from '@application/ports/SearchService'
import type { CuratedListEditView } from '@application/curatedList/GetCuratedListForEditUseCase'
import {
  createCuratedListAction,
  updateCuratedListAction,
  uploadCoverAction,
  importCoverAction,
} from './actions'
import {
  CuratedListFormValues,
  CuratedRuleValues,
  EMPTY_RULE,
  KIND_OPTIONS,
  isRuleEmptyValues,
} from './types'

interface PlaceOption {
  id: string
  name: string
}

interface Props {
  facets: PlaceFacets
  places: PlaceOption[]
  initial?: CuratedListEditView
}

const BLANK: CuratedListFormValues = {
  name: '', kind: 'GUIDE', description: '', intro: '', coverImageUrl: '',
  rule: { ...EMPTY_RULE }, pins: [], isPublished: false,
}

function fromInitial(l: CuratedListEditView): CuratedListFormValues {
  const r = l.rule
  return {
    name: l.name,
    kind: l.kind,
    description: l.description ?? '',
    intro: l.intro ?? '',
    coverImageUrl: l.coverImageUrl ?? '',
    rule: {
      categorySlug: r.categorySlug ?? '',
      subcategorySlug: r.subcategorySlug ?? '',
      communeSlug: r.communeSlug ?? '',
      neighborhoodSlug: r.neighborhoodSlug ?? '',
      metroLineCode: r.metroLineCode ?? '',
      priceRanges: r.priceRanges ? [...r.priceRanges] : [],
      socialTagSlugs: r.socialTagSlugs ? [...r.socialTagSlugs] : [],
      accessTagSlugs: r.accessTagSlugs ? [...r.accessTagSlugs] : [],
      vibeTagSlugs: r.vibeTagSlugs ? [...r.vibeTagSlugs] : [],
      walkInOnly: r.walkInOnly ?? false,
    },
    pins: l.pins.map((p) => ({ placeId: p.placeId, blurb: p.blurb ?? '' })),
    isPublished: l.isPublished,
  }
}

export function CuratedListForm({ facets, places, initial }: Props) {
  const router = useRouter()
  const mode = initial ? 'edit' : 'create'
  const [values, setValues] = useState<CuratedListFormValues>(initial ? fromInitial(initial) : BLANK)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [pinToAdd, setPinToAdd] = useState('')

  const placeById = useMemo(() => new Map(places.map((p) => [p.id, p.name])), [places])
  const ruleEmpty = isRuleEmptyValues(values.rule)

  function set<K extends keyof CuratedListFormValues>(key: K, value: CuratedListFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }
  function setRule<K extends keyof CuratedRuleValues>(key: K, value: CuratedRuleValues[K]) {
    setValues((v) => ({ ...v, rule: { ...v.rule, [key]: value } }))
  }
  function toggleRuleMulti(key: 'priceRanges' | 'socialTagSlugs' | 'accessTagSlugs' | 'vibeTagSlugs', val: string) {
    setValues((v) => {
      const cur = v.rule[key]
      const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val]
      return { ...v, rule: { ...v.rule, [key]: next } }
    })
  }

  // ── Portada: subir archivo / traer desde URL (ambos rehospedan en el Blob) ──
  async function uploadCover(file: File) {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadCoverAction(fd)
      if ('error' in res) setError(res.error)
      else set('coverImageUrl', res.url)
    } finally {
      setUploading(false)
    }
  }
  async function importCover() {
    const src = values.coverImageUrl.trim()
    if (!src) {
      setError('Pega primero una URL en el campo de la portada.')
      return
    }
    setError(null)
    setImporting(true)
    try {
      const res = await importCoverAction(src)
      if ('error' in res) setError(res.error)
      else set('coverImageUrl', res.url)
    } finally {
      setImporting(false)
    }
  }

  // ── Destacados ──
  function addPin() {
    const id = pinToAdd
    if (!id) return
    setValues((v) =>
      v.pins.some((p) => p.placeId === id) ? v : { ...v, pins: [...v.pins, { placeId: id, blurb: '' }] },
    )
    setPinToAdd('')
  }
  function updatePinBlurb(i: number, blurb: string) {
    setValues((v) => ({ ...v, pins: v.pins.map((p, idx) => (idx === i ? { ...p, blurb } : p)) }))
  }
  function removePin(i: number) {
    setValues((v) => ({ ...v, pins: v.pins.filter((_, idx) => idx !== i) }))
  }
  function movePin(i: number, dir: -1 | 1) {
    setValues((v) => {
      const j = i + dir
      if (j < 0 || j >= v.pins.length) return v
      const pins = [...v.pins]
      ;[pins[i], pins[j]] = [pins[j], pins[i]]
      return { ...v, pins }
    })
  }

  const availablePlaces = useMemo(
    () => places.filter((p) => !values.pins.some((pin) => pin.placeId === p.id)),
    [places, values.pins],
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (ruleEmpty) {
      setError('La regla está vacía: elige al menos un filtro (categoría, comuna, etc.).')
      return
    }
    startTransition(async () => {
      const result =
        mode === 'edit'
          ? await updateCuratedListAction(initial!.id, values)
          : await createCuratedListAction(values)
      if ('error' in result) {
        setError(result.error)
        return
      }
      if (mode === 'create') router.push('/admin/listas')
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      {/* ── Editorial ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Datos de la lista</h3>

        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="name">Nombre *</label>
            <input id="name" className="form-input" value={values.name}
              onChange={(e) => set('name', e.target.value)} required
              placeholder="Ej: Los mejores museos de Santiago" />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="kind">Tipo</label>
            <select id="kind" className="form-input" value={values.kind}
              onChange={(e) => set('kind', e.target.value as CuratedListFormValues['kind'])}>
              {KIND_OPTIONS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="description">Descripción (meta SEO)</label>
          <textarea id="description" className="form-input" rows={2} value={values.description}
            onChange={(e) => set('description', e.target.value)} maxLength={160} />
          <p className="admin-form__hint">~160 caracteres: es el texto del buscador y de las redes al compartir.</p>
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="intro">Introducción</label>
          <textarea id="intro" className="form-input" rows={4} value={values.intro}
            onChange={(e) => set('intro', e.target.value)} />
          <p className="admin-form__hint">Bajada editorial que abre la página (opcional, texto largo).</p>
        </div>

        {/* ── Portada ── */}
        <div className="form-row">
          <label className="form-label" htmlFor="coverImageUrl">Portada</label>
          {values.coverImageUrl && (
            <div className="admin-form__logo-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values.coverImageUrl} alt="Portada" width={160} height={90} style={{ objectFit: 'cover' }} />
            </div>
          )}
          <div className="admin-form__logo-actions">
            <label className="btn btn--ghost btn--sm">
              {uploading ? 'Subiendo…' : 'Subir archivo'}
              <input type="file" accept="image/*" hidden disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadCover(file)
                  e.target.value = ''
                }} />
            </label>
            <button type="button" className="btn btn--ghost btn--sm" onClick={importCover} disabled={importing}>
              {importing ? 'Trayendo…' : 'Traer desde URL'}
            </button>
          </div>
          <input id="coverImageUrl" className="form-input" value={values.coverImageUrl} placeholder="o pega una URL"
            onChange={(e) => set('coverImageUrl', e.target.value)} />
          <p className="admin-form__hint">
            Sube el archivo o pega una URL y toca “Traer” (se rehospeda en nuestro almacenamiento).
            Hosts permitidos: {ALLOWED_IMAGE_HOSTS.join(', ')}.
          </p>
        </div>
      </section>

      {/* ── Regla (qué lugares entran) ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Regla — qué lugares entran</h3>
        <p className="admin-form__hint">
          La lista se arma sola con estos filtros (mismo criterio que el explorar) y se mantiene
          al día a medida que cargas lugares. Elige al menos uno.
        </p>

        <div className="form-grid-2">
          <RuleSelect label="Categoría" options={facets.categories} value={values.rule.categorySlug}
            onChange={(v) => setRule('categorySlug', v)} />
          <RuleSelect label="Subcategoría" options={facets.subcategories} value={values.rule.subcategorySlug}
            onChange={(v) => setRule('subcategorySlug', v)} />
          <RuleSelect label="Comuna" options={facets.communes} value={values.rule.communeSlug}
            onChange={(v) => setRule('communeSlug', v)} />
          <RuleSelect label="Barrio" options={facets.neighborhoods} value={values.rule.neighborhoodSlug}
            onChange={(v) => setRule('neighborhoodSlug', v)} />
          <RuleSelect label="Línea de metro" options={facets.metroLines} value={values.rule.metroLineCode}
            onChange={(v) => setRule('metroLineCode', v)} />
        </div>

        <RuleChips label="Presupuesto" options={facets.priceRanges}
          selected={values.rule.priceRanges} onToggle={(v) => toggleRuleMulti('priceRanges', v)} />
        <RuleChips label="¿Con quién?" options={facets.social}
          selected={values.rule.socialTagSlugs} onToggle={(v) => toggleRuleMulti('socialTagSlugs', v)} />
        <RuleChips label="Ambiente" options={facets.vibe}
          selected={values.rule.vibeTagSlugs} onToggle={(v) => toggleRuleMulti('vibeTagSlugs', v)} />
        <RuleChips label="Accesibilidad" options={facets.access}
          selected={values.rule.accessTagSlugs} onToggle={(v) => toggleRuleMulti('accessTagSlugs', v)} />

        <div className="form-row">
          <label className="admin-form__check">
            <input type="checkbox" checked={values.rule.walkInOnly}
              onChange={(e) => setRule('walkInOnly', e.target.checked)} />
            Solo lugares sin reserva
          </label>
        </div>

        {ruleEmpty && <p className="admin-form__hint" style={{ color: 'var(--accent-700, #b45309)' }}>
          ⚠️ La regla está vacía: sin filtros, la lista no se puede guardar.
        </p>}
      </section>

      {/* ── Destacados ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Destacados (opcional)</h3>
        <p className="admin-form__hint">
          Lugares fijados a mano que van <strong>arriba</strong> del resto, en este orden, con una
          bajada editorial. Solo aparecen los que estén publicados.
        </p>

        <div className="admin-form__repeat-row">
          <select className="form-input" value={pinToAdd} onChange={(e) => setPinToAdd(e.target.value)}>
            <option value="">Elige un lugar…</option>
            {availablePlaces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button type="button" className="btn btn--ghost btn--sm" onClick={addPin} disabled={!pinToAdd}>
            + Agregar destacado
          </button>
        </div>

        {values.pins.map((pin, i) => (
          <div key={pin.placeId} className="form-row" style={{ borderTop: '1px solid var(--line, #e7e2d9)', paddingTop: 'var(--s-3, 12px)' }}>
            <div className="admin-form__repeat-row">
              <strong style={{ flex: 1 }}>
                {i + 1}. {placeById.get(pin.placeId) ?? '(lugar no encontrado)'}
              </strong>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => movePin(i, -1)} disabled={i === 0} aria-label="Subir">↑</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => movePin(i, 1)} disabled={i === values.pins.length - 1} aria-label="Bajar">↓</button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => removePin(i)}>Quitar</button>
            </div>
            <input className="form-input" value={pin.blurb} placeholder="Bajada: qué es / qué esperar (opcional)"
              onChange={(e) => updatePinBlurb(i, e.target.value)} />
          </div>
        ))}
      </section>

      {/* ── Publicación ── */}
      <section className="admin-form__section">
        <div className="form-row">
          <label className="admin-form__check">
            <input type="checkbox" checked={values.isPublished}
              onChange={(e) => set('isPublished', e.target.checked)} />
            Publicada (visible en /lista/[slug] y en la home)
          </label>
          <p className="admin-form__hint">Si está apagada, queda como borrador: 404 para el público.</p>
        </div>
      </section>

      {error && <p role="alert" className="form-error-banner">{error}</p>}
      {success && <p className="admin-form__success">Cambios guardados.</p>}

      <div className="admin-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear lista'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => router.push('/admin/listas')}>
          Volver
        </button>
      </div>
    </form>
  )
}

// ── Subcomponentes ──
function RuleSelect({
  label, options, value, onChange,
}: { label: string; options: FacetCount[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="form-row">
      <label className="form-label">{label}</label>
      <select className="form-input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— Cualquiera —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label} ({o.count})</option>
        ))}
      </select>
    </div>
  )
}

function RuleChips({
  label, options, selected, onToggle,
}: { label: string; options: FacetCount[]; selected: string[]; onToggle: (v: string) => void }) {
  if (options.length === 0) return null
  return (
    <div className="form-row">
      <span className="form-label">{label}</span>
      <div className="chip-set">
        {options.map((o) => {
          const active = selected.includes(o.value)
          return (
            <button key={o.value} type="button"
              className={`chip chip--count${active ? ' chip--accent' : ''}`}
              aria-pressed={active} onClick={() => onToggle(o.value)}>
              {o.label}
              <span className="chip__count">{o.count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
