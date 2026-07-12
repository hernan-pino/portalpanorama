'use client'
import { useState, useTransition } from 'react'
import {
  uploadOwnedPlaceImageAction,
  importOwnedPlaceImageAction,
  saveOwnedPlaceImagesAction,
} from './actions'

export interface OwnerPhoto {
  url: string
  alt: string
  isPrimary: boolean
}

const MAX_PHOTOS = 12

// Gestión de fotos del dueño: subir/importar, reordenar, elegir portada, quitar.
// Las fotos se suben al storage al tiro (devuelven URL); el orden/portada/alt se
// persisten recién al tocar "Guardar fotos". Sección autocontenida (guarda aparte
// del form de campos operacionales).
export function OwnerPhotos({ slug, initial }: { slug: string; initial: OwnerPhoto[] }) {
  const [photos, setPhotos] = useState<OwnerPhoto[]>(() =>
    initial.length > 0 ? ensurePrimary(initial) : [],
  )
  const [urlDraft, setUrlDraft] = useState('')
  const [busy, setBusy] = useState<null | 'upload' | 'import'>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isSaving, startSave] = useTransition()

  const atLimit = photos.length >= MAX_PHOTOS

  function markDirty() {
    setSaved(false)
    setError(null)
  }

  function addPhoto(url: string) {
    setPhotos((prev) => ensurePrimary([...prev, { url, alt: '', isPrimary: prev.length === 0 }]))
  }

  async function handleUpload(file: File) {
    markDirty()
    setBusy('upload')
    const fd = new FormData()
    fd.append('slug', slug)
    fd.append('file', file)
    const res = await uploadOwnedPlaceImageAction(fd)
    setBusy(null)
    if ('error' in res) { setError(res.error); return }
    addPhoto(res.url)
  }

  async function handleImport() {
    const src = urlDraft.trim()
    if (!src) return
    markDirty()
    setBusy('import')
    const res = await importOwnedPlaceImageAction(slug, src)
    setBusy(null)
    if ('error' in res) { setError(res.error); return }
    addPhoto(res.url)
    setUrlDraft('')
  }

  function setAlt(i: number, alt: string) {
    markDirty()
    setPhotos((prev) => prev.map((p, idx) => (idx === i ? { ...p, alt } : p)))
  }

  function setCover(i: number) {
    markDirty()
    setPhotos((prev) => ensurePrimary(prev.map((p, idx) => ({ ...p, isPrimary: idx === i }))))
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= photos.length) return
    markDirty()
    setPhotos((prev) => {
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  function remove(i: number) {
    markDirty()
    setPhotos((prev) => ensurePrimary(prev.filter((_, idx) => idx !== i)))
  }

  function handleSave() {
    setError(null)
    setSaved(false)
    startSave(async () => {
      const res = await saveOwnedPlaceImagesAction(
        slug,
        photos.map((p) => ({ url: p.url, alt: p.alt || undefined, isPrimary: p.isPrimary })),
      )
      if ('error' in res) { setError(res.error); return }
      setSaved(true)
    })
  }

  return (
    <section className="ophotos">
      <div className="ophotos__head">
        <h2 className="ophotos__title">Fotos de tu local</h2>
        <span className="ophotos__count">{photos.length} de {MAX_PHOTOS}</span>
      </div>

      <div className="ophotos__tips">
        <p className="ophotos__tips-title">Las que mejor funcionan</p>
        <ul className="ophotos__tips-list">
          <li><strong>Fachada o entrada</strong><span>para reconocerte al llegar</span></li>
          <li><strong>Interior / ambiente</strong><span>cómo se siente estar ahí</span></li>
          <li><strong>Producto estrella</strong><span>el plato o producto que te distingue</span></li>
        </ul>
        <p className="ophotos__tips-foot">
          Fotos propias, horizontales y bien iluminadas. La <strong>portada</strong> es la primera
          que ve la gente.
        </p>
      </div>

      <ul className="ophotos__grid">
        {photos.map((p, i) => (
          <li key={p.url} className={`ophoto${p.isPrimary ? ' ophoto--cover' : ''}`}>
            <div className="ophoto__frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="ophoto__img" src={p.url} alt={p.alt || ''} />
              {p.isPrimary && <span className="ophoto__tag">Portada</span>}
            </div>

            <div className="ophoto__bar">
              <button type="button" className="ophoto__cover-btn" onClick={() => setCover(i)}
                disabled={p.isPrimary} title={p.isPrimary ? 'Es la portada' : 'Hacer portada'}>
                <span aria-hidden="true">{p.isPrimary ? '★' : '☆'}</span>
                <span className="ophoto__cover-label">Portada</span>
              </button>
              <div className="ophoto__reorder" role="group" aria-label="Reordenar">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover antes">←</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Mover después">→</button>
              </div>
              <button type="button" className="ophoto__remove" onClick={() => remove(i)} aria-label="Quitar foto">
                Quitar
              </button>
            </div>

            <input
              className="ophoto__alt"
              value={p.alt}
              onChange={(e) => setAlt(i, e.target.value)}
              maxLength={200}
              placeholder="Describe la foto (opcional)"
              aria-label="Descripción de la foto"
            />
          </li>
        ))}

        {!atLimit && (
          <li className="ophoto ophoto--add">
            <label className={`ophoto__drop${busy === 'upload' ? ' is-busy' : ''}`}>
              <input type="file" accept="image/*" hidden disabled={busy !== null}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleUpload(f)
                  e.target.value = ''
                }} />
              <span className="ophoto__drop-plus" aria-hidden="true">+</span>
              <span className="ophoto__drop-text">{busy === 'upload' ? 'Subiendo…' : 'Subir foto'}</span>
            </label>
          </li>
        )}
      </ul>

      {atLimit && (
        <p className="ophotos__note">Llegaste al máximo de {MAX_PHOTOS} fotos. Quita alguna para sumar otra.</p>
      )}

      {!atLimit && (
        <div className="ophotos__url">
          <input className="form-input" type="url" value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="…o pega la URL de una imagen" disabled={busy !== null} />
          <button type="button" className="btn btn--ghost btn--sm"
            disabled={busy !== null || !urlDraft.trim()} onClick={() => void handleImport()}>
            {busy === 'import' ? 'Trayendo…' : 'Traer'}
          </button>
        </div>
      )}

      {error && <p className="ophotos__error">{error}</p>}
      {saved && <p className="ophotos__ok">✓ Fotos guardadas. Ya se ven en tu ficha.</p>}

      <div className="ophotos__save">
        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Guardando…' : 'Guardar fotos'}
        </button>
      </div>
    </section>
  )
}

// Garantiza que haya exactamente una portada mientras queden fotos: si ninguna
// está marcada (p.ej. tras quitar la portada), asciende la primera.
function ensurePrimary(list: OwnerPhoto[]): OwnerPhoto[] {
  if (list.length === 0 || list.some((p) => p.isPrimary)) return list
  return list.map((p, i) => (i === 0 ? { ...p, isPrimary: true } : p))
}
