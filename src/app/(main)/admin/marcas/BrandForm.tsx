'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ALLOWED_IMAGE_HOSTS } from '@lib/imageHosts'
import type { BrandEditView } from '@application/brand/GetBrandForEditUseCase'
import {
  createBrandAction,
  updateBrandAction,
  uploadBrandLogoAction,
  importBrandLogoAction,
} from './actions'
import { BrandFormValues, BRAND_SOCIAL_NETWORK_OPTIONS } from './types'

const BLANK: BrandFormValues = {
  name: '', logoUrl: '', description: '', website: '', instagram: '', socialLinks: [],
}

function fromInitial(b: BrandEditView): BrandFormValues {
  return {
    name: b.name,
    logoUrl: b.logoUrl ?? '',
    description: b.description ?? '',
    website: b.website ?? '',
    instagram: b.instagram ?? '',
    socialLinks: b.socialLinks.map((s) => ({ network: s.network, url: s.url })),
  }
}

interface BrandFormProps {
  initial?: BrandEditView
}

export function BrandForm({ initial }: BrandFormProps) {
  const router = useRouter()
  const mode = initial ? 'edit' : 'create'
  const [values, setValues] = useState<BrandFormValues>(initial ? fromInitial(initial) : BLANK)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importing, setImporting] = useState(false)

  function set<K extends keyof BrandFormValues>(key: K, value: BrandFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  // ── Logo: subir archivo / traer desde URL (ambos rehospedan en el Blob) ──
  async function uploadLogo(file: File) {
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await uploadBrandLogoAction(fd)
      if ('error' in res) setError(res.error)
      else set('logoUrl', res.url)
    } finally {
      setUploading(false)
    }
  }
  async function importLogo() {
    const src = values.logoUrl.trim()
    if (!src) {
      setError('Pegá primero una URL en el campo del logo.')
      return
    }
    setError(null)
    setImporting(true)
    try {
      const res = await importBrandLogoAction(src)
      if ('error' in res) setError(res.error)
      else set('logoUrl', res.url)
    } finally {
      setImporting(false)
    }
  }

  // ── Redes sociales extra ──
  function addSocialLink() {
    setValues((v) => ({
      ...v,
      socialLinks: [...v.socialLinks, { network: BRAND_SOCIAL_NETWORK_OPTIONS[0], url: '' }],
    }))
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result =
        mode === 'edit'
          ? await updateBrandAction(initial!.id, values)
          : await createBrandAction(values)
      if ('error' in result) {
        setError(result.error)
        return
      }
      if (mode === 'create') router.push('/admin/marcas')
      else setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Datos de la marca</h3>

        <div className="form-row">
          <label className="form-label" htmlFor="name">Nombre *</label>
          <input id="name" className="form-input" value={values.name}
            onChange={(e) => set('name', e.target.value)} required />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="description">Descripción</label>
          <textarea id="description" className="form-input" rows={3} value={values.description}
            onChange={(e) => set('description', e.target.value)} />
          <p className="admin-form__hint">Una línea sobre la marca (se muestra en su página).</p>
        </div>

        {/* ── Logo ── */}
        <div className="form-row">
          <label className="form-label" htmlFor="logoUrl">Logo</label>
          {values.logoUrl && (
            <div className="admin-form__logo-preview">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={values.logoUrl} alt="Logo" width={64} height={64} style={{ objectFit: 'contain' }} />
            </div>
          )}
          <div className="admin-form__logo-actions">
            <label className="btn btn--ghost btn--sm">
              {uploading ? 'Subiendo…' : 'Subir archivo'}
              <input type="file" accept="image/*" hidden disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) uploadLogo(file)
                  e.target.value = ''
                }} />
            </label>
            <button type="button" className="btn btn--ghost btn--sm" onClick={importLogo} disabled={importing}>
              {importing ? 'Trayendo…' : 'Traer desde URL'}
            </button>
          </div>
          <input id="logoUrl" className="form-input" value={values.logoUrl} placeholder="o pegá una URL"
            onChange={(e) => set('logoUrl', e.target.value)} />
          <p className="admin-form__hint">
            Subí el archivo o pegá una URL y tocá “Traer” (se rehospeda en nuestro almacenamiento).
            Hosts permitidos: {ALLOWED_IMAGE_HOSTS.join(', ')}.
          </p>
        </div>
      </section>

      {/* ── Contacto / redes ── */}
      <section className="admin-form__section">
        <h3 className="admin-form__legend">Contacto y redes</h3>
        <div className="form-grid-2">
          <div className="form-row">
            <label className="form-label" htmlFor="website">Sitio web</label>
            <input id="website" className="form-input" value={values.website}
              onChange={(e) => set('website', e.target.value)} placeholder="https://…" />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="instagram">Instagram</label>
            <input id="instagram" className="form-input" value={values.instagram}
              onChange={(e) => set('instagram', e.target.value)} placeholder="@marca o URL" />
          </div>
        </div>

        <div className="form-row">
          <span className="form-label">Otras redes</span>
          {values.socialLinks.map((s, i) => (
            <div key={i} className="admin-form__repeat-row">
              <select className="form-input" value={s.network}
                onChange={(e) => updateSocialLink(i, 'network', e.target.value)}>
                {BRAND_SOCIAL_NETWORK_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <input className="form-input" value={s.url} placeholder="URL del perfil"
                onChange={(e) => updateSocialLink(i, 'url', e.target.value)} />
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeSocialLink(i)}>
                Quitar
              </button>
            </div>
          ))}
          <button type="button" className="btn btn--ghost btn--sm" onClick={addSocialLink}>
            + Agregar red
          </button>
        </div>
      </section>

      {error && <p role="alert" className="form-error-banner">{error}</p>}
      {success && <p className="admin-form__success">Cambios guardados.</p>}

      <div className="admin-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isPending}>
          {isPending ? 'Guardando…' : mode === 'edit' ? 'Guardar cambios' : 'Crear marca'}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => router.push('/admin/marcas')}>
          Volver
        </button>
      </div>
    </form>
  )
}
