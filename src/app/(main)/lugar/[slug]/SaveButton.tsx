'use client'
import { useState, useRef, useEffect, useTransition } from 'react'
import { BookmarkIcon } from './icons'
import { saveToCollectionAction, createListAndSaveAction } from './actions'

interface Collection {
  id: string
  name: string
  itemCount: number
}

interface Props {
  placeId: string
  isLoggedIn: boolean
  collections: Collection[]
}

export function SaveButton({ placeId, isLoggedIn, collections }: Props) {
  const [open, setOpen] = useState(false)
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

  function saveTo(collectionId: string, label: string) {
    setError(null)
    startTransition(async () => {
      const res = await saveToCollectionAction(placeId, collectionId)
      if ('error' in res) { setError(res.error); return }
      setSavedIn(label)
      setOpen(false)
    })
  }

  function createAndSave() {
    setError(null)
    startTransition(async () => {
      const res = await createListAndSaveAction(placeId, newName)
      if ('error' in res) { setError(res.error); return }
      setSavedIn(newName.trim())
      setNewName('')
      setOpen(false)
    })
  }

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
        <BookmarkIcon /> {savedIn ? `Guardado en ${savedIn}` : 'Guardar'}
      </button>

      {open && (
        <div className="ficha__pop" role="menu">
          <h4>Guardar en una lista</h4>

          {collections.length > 0 && (
            <div className="ficha__pop-list">
              {collections.map((c) => (
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
          )}

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
