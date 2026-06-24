'use client'
import { useState, useRef, useEffect, useTransition } from 'react'
import { BookmarkIcon } from './icons'
import {
  saveToCollectionAction,
  saveToDefaultCollectionAction,
  createListAndSaveAction,
} from '@/app/actions/collections'
import { trackEvent } from '@lib/analytics'

interface Collection {
  id: string
  name: string
  itemCount: number
}

interface Props {
  placeId: string
  isLoggedIn: boolean
  isSaved: boolean
  collections: Collection[]
  defaultCollectionId: string | null
  defaultName: string
}

export function SaveButton({
  placeId, isLoggedIn, isSaved, collections, defaultCollectionId, defaultName,
}: Props) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(isSaved)
  const [savedIn, setSavedIn] = useState<string | null>(null)
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
  ) {
    setError(null)
    startTransition(async () => {
      const res = await action()
      if ('error' in res) { setError(res.error); return }
      trackEvent('guardar_lugar', { place_id: placeId, origen: 'ficha' })
      setSaved(true)
      setSavedIn(label)
      setNewName('')
      setOpen(false)
    })
  }

  function saveDefault() {
    run(() => saveToDefaultCollectionAction(placeId), defaultRow?.name ?? defaultName)
  }
  function saveTo(collectionId: string, label: string) {
    run(() => saveToCollectionAction(placeId, collectionId), label)
  }
  function createAndSave() {
    if (!newName.trim()) return
    run(() => createListAndSaveAction(placeId, newName), newName.trim())
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

      {open && (
        <div className="ficha__pop" role="menu">
          <h4>Guardar en una lista</h4>

          <div className="ficha__pop-list">
            <button
              type="button"
              className="ficha__pop-item ficha__pop-item--default"
              disabled={isPending}
              onClick={saveDefault}
            >
              <span>{defaultRow?.name ?? defaultName}<span className="ficha__pop-badge">por defecto</span></span>
              <span className="count">{defaultRow?.itemCount ?? 0}</span>
            </button>

            {others.map((c) => (
              <button
                key={c.id}
                type="button"
                className="ficha__pop-item"
                disabled={isPending}
                onClick={() => saveTo(c.id, c.name)}
              >
                <span>{c.name}</span>
                <span className="count">{c.itemCount}</span>
              </button>
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
