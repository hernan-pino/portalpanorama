'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
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
  placeName: string
  isLoggedIn: boolean
  isSaved: boolean
  // Listas del usuario que YA contienen este lugar (check en el modal, s27).
  savedInIds: string[]
  collections: Collection[]
  defaultCollectionId: string | null
  defaultName: string
}

// Corazón de guardar sobre la tarjeta. Visitante anónimo → pop-up que invita a
// entrar/registrarse (no redirección seca, decisión 4E §8.5). Usuario → modal con
// sus listas + crear una nueva. "Favoritos" sale siempre fijada arriba y marcada
// como predeterminada (se crea al vuelo la primera vez). El corazón arranca relleno
// si el lugar ya está guardado en alguna lista (isSaved); las listas que ya lo
// tienen salen con check y sin acción. Guardar confirma con un toast (s27).
// El modal es fijo/centrado para no recortarse dentro de la grilla. Reusa las
// acciones compartidas con la ficha.
export function SaveHeart({
  placeId, placeName, isLoggedIn, isSaved, savedInIds, collections, defaultCollectionId, defaultName,
}: Props) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(isSaved)
  const [inIds, setInIds] = useState(savedInIds)
  const [toast, setToast] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // "Favoritos" va primero y marcada; el resto de listas abajo, sin duplicarla.
  const defaultRow = collections.find((c) => c.id === defaultCollectionId)
  const others = collections.filter((c) => c.id !== defaultCollectionId)

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

  function run(
    action: () => Promise<{ error: string } | { success: true } | { success: true; collectionId: string }>,
    message: string,
    collectionId?: string,
  ) {
    setError(null)
    startTransition(async () => {
      const res = await action()
      if ('error' in res) { setError(res.error); return }
      trackEvent('guardar_lugar', { place_id: placeId, place_name: placeName, origen: 'tarjeta' })
      setSaved(true)
      const savedId = collectionId ?? ('collectionId' in res ? res.collectionId : undefined)
      if (savedId) setInIds((ids) => (ids.includes(savedId) ? ids : [...ids, savedId]))
      setToast(message)
      close()
    })
  }

  function saveDefault() {
    run(
      () => saveToDefaultCollectionAction(placeId),
      `Se agregó a ${defaultRow?.name ?? defaultName}`,
      defaultCollectionId ?? undefined,
    )
  }
  function saveTo(collectionId: string, name: string) {
    run(() => saveToCollectionAction(placeId, collectionId), `Se agregó a ${name}`, collectionId)
  }
  function createAndSave() {
    const name = newName.trim()
    if (!name) return
    run(() => createListAndSaveAction(placeId, name), `Se creó ${name} y se agregó`)
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

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

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
                <h4 className="save-modal__title">Guarda este lugar</h4>
                <p className="save-modal__lead">
                  Crea una cuenta o inicia sesión para guardar <strong>{placeName}</strong> en tus listas.
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

                <div className="save-modal__list">
                  {/* Lista por defecto (siempre presente, marcada) */}
                  <SaveRow
                    className="save-modal__item save-modal__item--default"
                    name={defaultRow?.name ?? defaultName}
                    badge="por defecto"
                    count={defaultRow?.itemCount ?? 0}
                    isIn={defaultCollectionId != null && inIds.includes(defaultCollectionId)}
                    disabled={isPending}
                    onSave={saveDefault}
                  />

                  {others.map((c) => (
                    <SaveRow
                      key={c.id}
                      className="save-modal__item"
                      name={c.name}
                      count={c.itemCount}
                      isIn={inIds.includes(c.id)}
                      disabled={isPending}
                      onSave={() => saveTo(c.id, c.name)}
                    />
                  ))}
                </div>

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

// Fila de lista en el modal. Si el lugar ya está en ella, muestra el check y no
// vuelve a guardar (se quita desde Mi cuenta › la lista).
function SaveRow({
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
      <span>{name}{badge && <span className="save-modal__badge">{badge}</span>}</span>
      {isIn ? <span className="save-modal__check">✓ guardado</span> : <span className="count">{count}</span>}
    </button>
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
