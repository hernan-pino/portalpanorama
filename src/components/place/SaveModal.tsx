'use client'
import { useEffect, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import {
  saveToCollectionAction,
  saveToDefaultCollectionAction,
  createListAndSaveAction,
} from '@/app/actions/collections'
import { trackEvent } from '@lib/analytics'

export interface SaveCollection {
  id: string
  name: string
  itemCount: number
}

interface Props {
  placeId: string
  placeName: string
  isLoggedIn: boolean
  /** Listas del usuario que YA contienen este lugar: salen con check y sin acción. */
  savedInIds: string[]
  collections: SaveCollection[]
  defaultCollectionId: string | null
  defaultName: string
  /** A dónde volver si el visitante entra a su cuenta desde acá. */
  returnTo: string
  origen: 'tarjeta' | 'ficha'
  onClose: () => void
  onSaved: (result: { collectionId?: string; message: string; listName: string }) => void
}

// Único modal de guardar del sitio: lo abren el corazón de la tarjeta, el botón de
// la ficha y la barra fija de móvil. Se monta en <body> con un portal — si cuelga de
// su botón, cualquier ancestro con transform/filter/contain lo atrapa (deja de ser
// fijo respecto del viewport) y termina recortado dentro de la tarjeta o dibujado
// fuera de pantalla bajo la barra de abajo.
//
// Visitante anónimo → invitación a entrar/registrarse conservando el lugar (nunca
// una redirección seca al login). Usuario → sus listas + crear una nueva.
export function SaveModal({
  placeId, placeName, isLoggedIn, savedInIds, collections,
  defaultCollectionId, defaultName, returnTo, origen, onClose, onSaved,
}: Props) {
  const [inIds, setInIds] = useState(savedInIds)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    // El fondo no scrollea mientras el modal está abierto.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  if (!mounted) return null

  // "Favoritos" va primero y marcada; el resto de listas abajo, sin duplicarla.
  const defaultRow = collections.find((c) => c.id === defaultCollectionId)
  const others = collections.filter((c) => c.id !== defaultCollectionId)

  function run(
    action: () => Promise<{ error: string } | { success: true } | { success: true; collectionId: string }>,
    listName: string,
    message: string,
    collectionId?: string,
  ) {
    setError(null)
    startTransition(async () => {
      const res = await action()
      if ('error' in res) { setError(res.error); return }
      trackEvent('guardar_lugar', { place_id: placeId, place_name: placeName, origen })
      const savedId = collectionId ?? ('collectionId' in res ? res.collectionId : undefined)
      if (savedId) setInIds((ids) => (ids.includes(savedId) ? ids : [...ids, savedId]))
      onSaved({ collectionId: savedId, message, listName })
    })
  }

  function saveDefault() {
    const name = defaultRow?.name ?? defaultName
    run(() => saveToDefaultCollectionAction(placeId), name, `Se agregó a ${name}`, defaultCollectionId ?? undefined)
  }
  function saveTo(collectionId: string, name: string) {
    run(() => saveToCollectionAction(placeId, collectionId), name, `Se agregó a ${name}`, collectionId)
  }
  function createAndSave() {
    const name = newName.trim()
    if (!name) return
    run(() => createListAndSaveAction(placeId, name), name, `Se creó ${name} y se agregó`)
  }

  return createPortal(
    <div
      className="save-modal__scrim"
      role="presentation"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose() }}
    >
      <div
        className="save-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Guardar lugar"
        onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
      >
        <button type="button" className="save-modal__close" aria-label="Cerrar" onClick={onClose}>×</button>

        {!isLoggedIn ? (
          <>
            <h4 className="save-modal__title">Guarda este lugar</h4>
            <p className="save-modal__lead">
              Crea una cuenta o inicia sesión para guardar <strong>{placeName}</strong> en tus listas.
            </p>
            <div className="save-modal__actions">
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(returnTo)}`}
                className="btn btn--accent"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Iniciar sesión
              </Link>
              <Link
                href={`/registro?callbackUrl=${encodeURIComponent(returnTo)}`}
                className="btn btn--ghost"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Registrarme
              </Link>
            </div>
          </>
        ) : (
          <>
            <h4 className="save-modal__title">Guardar en una lista</h4>

            <div className="save-modal__list">
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
    </div>,
    document.body,
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
