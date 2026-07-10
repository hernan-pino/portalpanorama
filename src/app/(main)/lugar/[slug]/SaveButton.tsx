'use client'
import { useState, useRef, useEffect, useTransition } from 'react'
import { BookmarkIcon } from './icons'
import {
  saveToCollectionAction,
  saveToDefaultCollectionAction,
  createListAndSaveAction,
} from '@/app/actions/collections'
import { trackEvent } from '@lib/analytics'
import { Toast } from '@components/ui/Toast'

interface Collection {
  id: string
  name: string
  itemCount: number
}

interface Props {
  placeId: string
  isLoggedIn: boolean
  isSaved: boolean
  // Listas del usuario que YA contienen este lugar (check en el popover, s27).
  savedInIds: string[]
  collections: Collection[]
  defaultCollectionId: string | null
  defaultName: string
}

export function SaveButton({
  placeId, isLoggedIn, isSaved, savedInIds, collections, defaultCollectionId, defaultName,
}: Props) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(isSaved)
  const [savedIn, setSavedIn] = useState<string | null>(null)
  const [inIds, setInIds] = useState(savedInIds)
  const [toast, setToast] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  if (!isLoggedIn) {
    return (
      <a href="/login" className="btn btn--accent" style={{ justifyContent: 'center' }}>
        <BookmarkIcon /> Guardar
      </a>
    )
  }

  // "Favoritos" primero y marcada; el resto abajo, sin duplicarla.
  const defaultRow = collections.find((c) => c.id === defaultCollectionId)
  const others = collections.filter((c) => c.id !== defaultCollectionId)

  function run(
    action: () => Promise<{ error: string } | { success: true } | { success: true; collectionId: string }>,
    label: string,
    message: string,
    collectionId?: string,
  ) {
    setError(null)
    startTransition(async () => {
      const res = await action()
      if ('error' in res) { setError(res.error); return }
      trackEvent('guardar_lugar', { place_id: placeId, origen: 'ficha' })
      setSaved(true)
      setSavedIn(label)
      const savedId = collectionId ?? ('collectionId' in res ? res.collectionId : undefined)
      if (savedId) setInIds((ids) => (ids.includes(savedId) ? ids : [...ids, savedId]))
      setToast(message)
      setNewName('')
      setOpen(false)
    })
  }

  function saveDefault() {
    const name = defaultRow?.name ?? defaultName
    run(() => saveToDefaultCollectionAction(placeId), name, `Se agregó a ${name}`, defaultCollectionId ?? undefined)
  }
  function saveTo(collectionId: string, label: string) {
    run(() => saveToCollectionAction(placeId, collectionId), label, `Se agregó a ${label}`, collectionId)
  }
  function createAndSave() {
    const name = newName.trim()
    if (!name) return
    run(() => createListAndSaveAction(placeId, name), name, `Se creó ${name} y se agregó`)
  }

  const label = savedIn ? `Guardado en ${savedIn}` : saved ? 'Guardado' : 'Guardar'

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      <button
        type="button"
        className="btn btn--accent"
        style={{ width: '100%', justifyContent: 'center' }}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <BookmarkIcon /> {label}
      </button>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {open && (
        <div className="ficha__pop" role="menu">
          <h4>Guardar en una lista</h4>

          <div className="ficha__pop-list">
            <PopRow
              className="ficha__pop-item ficha__pop-item--default"
              name={defaultRow?.name ?? defaultName}
              badge="por defecto"
              count={defaultRow?.itemCount ?? 0}
              isIn={defaultCollectionId != null && inIds.includes(defaultCollectionId)}
              disabled={isPending}
              onSave={saveDefault}
            />

            {others.map((c) => (
              <PopRow
                key={c.id}
                className="ficha__pop-item"
                name={c.name}
                count={c.itemCount}
                isIn={inIds.includes(c.id)}
                disabled={isPending}
                onSave={() => saveTo(c.id, c.name)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
            <input
              className="input"
              style={{ height: 40 }}
              placeholder="Nueva lista…"
              value={newName}
              maxLength={60}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) createAndSave() }}
            />
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={isPending || !newName.trim()}
              onClick={createAndSave}
            >
              Crear
            </button>
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)', margin: 'var(--s-2) 0 0' }}>{error}</p>}
        </div>
      )}
    </div>
  )
}

// Fila del popover. Si el lugar ya está en la lista, muestra el check y no vuelve
// a guardar (se quita desde Mi cuenta › la lista).
function PopRow({
  className, name, badge, count, isIn, disabled, onSave,
}: {
  className: string
  name: string
  badge?: string
  count: number
  isIn: boolean
  disabled: boolean
  onSave: () => void
}) {
  return (
    <button
      type="button"
      className={`${className}${isIn ? ' is-in' : ''}`}
      disabled={disabled || isIn}
      title={isIn ? 'Ya está en esta lista' : undefined}
      onClick={onSave}
    >
      <span>{name}{badge && <span className="ficha__pop-badge">{badge}</span>}</span>
      {isIn ? <span className="save-modal__check">✓ guardado</span> : <span className="count">{count}</span>}
    </button>
  )
}
