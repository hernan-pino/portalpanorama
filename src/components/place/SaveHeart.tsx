'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { saveToCollectionAction, createListAndSaveAction } from '@/app/actions/collections'

interface Collection {
  id: string
  name: string
  itemCount: number
}

interface Props {
  placeId: string
  placeName: string
  isLoggedIn: boolean
  collections: Collection[]
}

// Corazón de guardar sobre la tarjeta. Visitante anónimo → pop-up que invita a
// entrar/registrarse (no redirección seca, decisión 4E §8.5). Usuario → modal con
// sus listas + crear una nueva. El modal es fijo/centrado para no recortarse dentro
// de la grilla. Reusa las acciones compartidas con la ficha.
export function SaveHeart({ placeId, placeName, isLoggedIn, collections }: Props) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function onHeartClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setError(null)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    setNewName('')
    setError(null)
  }

  function saveTo(collectionId: string) {
    setError(null)
    startTransition(async () => {
      const res = await saveToCollectionAction(placeId, collectionId)
      if ('error' in res) { setError(res.error); return }
      setSaved(true)
      close()
    })
  }

  function createAndSave() {
    if (!newName.trim()) return
    setError(null)
    startTransition(async () => {
      const res = await createListAndSaveAction(placeId, newName)
      if ('error' in res) { setError(res.error); return }
      setSaved(true)
      close()
    })
  }

  return (
    <>
      <button
        type="button"
        className={`save-heart${saved ? ' is-saved' : ''}`}
        aria-label={saved ? `${placeName} guardado` : `Guardar ${placeName}`}
        aria-pressed={saved}
        onClick={onHeartClick}
      >
        <HeartGlyph filled={saved} />
      </button>

      {open && (
        <div
          className="save-modal__scrim"
          role="presentation"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); close() }}
        >
          <div
            className="save-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Guardar lugar"
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
          >
            {!isLoggedIn ? (
              <>
                <h4 className="save-modal__title">Guardá este lugar</h4>
                <p className="save-modal__lead">
                  Creá una cuenta o iniciá sesión para guardar <strong>{placeName}</strong> en tus listas.
                </p>
                <div className="save-modal__actions">
                  <Link href="/login" className="btn btn--accent" style={{ flex: 1, justifyContent: 'center' }}>
                    Iniciar sesión
                  </Link>
                  <Link href="/registro" className="btn btn--ghost" style={{ flex: 1, justifyContent: 'center' }}>
                    Registrarme
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h4 className="save-modal__title">Guardar en una lista</h4>

                {collections.length > 0 && (
                  <div className="save-modal__list">
                    {collections.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="save-modal__item"
                        disabled={isPending}
                        onClick={() => saveTo(c.id)}
                      >
                        <span>{c.name}</span>
                        <span className="count">{c.itemCount}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="save-modal__new">
                  <input
                    className="input"
                    style={{ height: 40 }}
                    placeholder="Nueva lista…"
                    value={newName}
                    maxLength={60}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') createAndSave() }}
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

                {error && <p className="save-modal__error">{error}</p>}
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function HeartGlyph({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 16.8S3 12.6 3 7.9A3.6 3.6 0 0 1 10 6.2 3.6 3.6 0 0 1 17 7.9c0 4.7-7 8.9-7 8.9z" />
    </svg>
  )
}
