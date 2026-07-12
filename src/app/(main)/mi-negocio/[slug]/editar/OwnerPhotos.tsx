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
export function OwnerPhotos({
  slug,
  initial,
}: {
  slug: string
  initial: OwnerPhoto[]
}) {
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
    setPhotos((prev) => prev.map((p, idx) => ({ ...p, isPrimary: idx === i })))
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
    <section style={{ maxWidth: 560, marginBottom: 'var(--s-6)' }}>
      <h2 className="owner-photos__title">Fotos de tu local</h2>
      <div className="owner-photos__tips">
        <p className="owner-photos__tips-title">Las fotos que mejor funcionan</p>
        <ul className="owner-photos__tips-list">
          <li><strong>La fachada o entrada</strong> — ayuda a que te reconozcan al llegar.</li>
          <li><strong>El interior / ambiente</strong> — cómo se siente estar ahí.</li>
          <li><strong>Tu producto estrella</strong> — el plato, trago o producto que te distingue.</li>
        </ul>
        <p className="owner-photos__tips-foot">
          Sube fotos propias, horizontales y bien iluminadas. La <strong>portada</strong> es la
          primera que ve la gente. Hasta {MAX_PHOTOS} fotos.
        </p>
      </div>

      {photos.length > 0 && (
        <ul className="owner-photos__grid">
          {photos.map((p, i) => (
            <li key={p.url} className="owner-photos__card">
              <div className="owner-photos__thumb-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="owner-photos__thumb" src={p.url} alt={p.alt || ''} />
                {p.isPrimary && <span className="owner-photos__badge">Portada</span>}
              </div>
              <input
                className="form-input owner-photos__alt"
                value={p.alt}
                onChange={(e) => setAlt(i, e.target.value)}
                maxLength={200}
                placeholder="Describe la foto (opcional)"
                aria-label="Descripción de la foto"
              />
              <div className="owner-photos__actions">
                {!p.isPrimary && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCover(i)}>
                    Portada
                  </button>
                )}
                <button type="button" className="btn btn--ghost btn--sm"
                  onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover antes">←</button>
                <button type="button" className="btn btn--ghost btn--sm"
                  onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Mover después">→</button>
                <button type="button" className="btn btn--ghost btn--sm owner-photos__remove"
                  onClick={() => remove(i)}>Quitar</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {photos.length === 0 && (
        <p className="owner-photos__empty">Todavía no hay fotos. Súmalas para que tu ficha luzca mejor.</p>
      )}

      {!atLimit && (
        <div className="owner-photos__add">
          <label className={`btn btn--ghost btn--sm ${busy ? 'is-disabled' : ''}`}>
            <input type="file" accept="image/*" hidden disabled={busy !== null}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleUpload(f)
                e.target.value = ''
              }} />
            {busy === 'upload' ? 'Subiendo…' : '+ Subir foto'}
          </label>
          <span className="owner-photos__or">o</span>
          <div className="owner-photos__url">
            <input className="form-input" type="url" value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="Pega una URL de imagen…" disabled={busy !== null} />
            <button type="button" className="btn btn--ghost btn--sm"
              disabled={busy !== null || !urlDraft.trim()} onClick={() => void handleImport()}>
              {busy === 'import' ? 'Trayendo…' : 'Traer'}
            </button>
          </div>
        </div>
      )}
      {atLimit && (
        <p className="owner-photos__empty">Llegaste al máximo de {MAX_PHOTOS} fotos. Quita alguna para sumar otra.</p>
      )}

      {error && <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', margin: 'var(--s-2) 0 0' }}>{error}</p>}
      {saved && <p style={{ color: 'var(--accent-70)', fontSize: 'var(--t-body-sm)', margin: 'var(--s-2) 0 0' }}>✓ Fotos guardadas. Ya se ven en tu ficha.</p>}

      <div style={{ marginTop: 'var(--s-4)' }}>
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
