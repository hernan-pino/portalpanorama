'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { publishPlaceAction, archivePlaceAction, deletePlaceAction } from './actions'

type ActionResult = { error: string } | { success: true }

// Acciones de estado por fila de la tabla del admin. Cliente porque dispara server
// actions y refresca la lista.
export function PlaceRowActions({
  id,
  name,
  status,
}: {
  id: string
  name: string
  status: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  // Modal de confirmación de borrado: se abre con el botón y exige tildar el check.
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmChecked, setConfirmChecked] = useState(false)

  function run(action: () => Promise<ActionResult>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  function openConfirm() {
    setConfirmChecked(false)
    setError(null)
    setConfirmOpen(true)
  }

  function doDelete() {
    setConfirmOpen(false)
    run(() => deletePlaceAction(id))
  }

  return (
    <div className="admin-row-actions">
      <Link href={`/admin/lugares/${id}`} className="btn btn--ghost btn--sm">Editar</Link>
      {status !== 'PUBLISHED' && (
        <button className="btn btn--ghost btn--sm" disabled={isPending}
          onClick={() => run(() => publishPlaceAction(id))}>Publicar</button>
      )}
      {status !== 'ARCHIVED' && (
        <button className="btn btn--ghost btn--sm" disabled={isPending}
          onClick={() => run(() => archivePlaceAction(id))}>Archivar</button>
      )}
      <button className="btn btn--ghost btn--sm admin-row-actions__danger" disabled={isPending}
        onClick={openConfirm}>Eliminar</button>
      {error && <span className="admin-row-actions__error" role="alert">{error}</span>}

      {confirmOpen && (
        <div
          className="confirm-modal__scrim"
          role="presentation"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`del-title-${id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={`del-title-${id}`} className="confirm-modal__title">Eliminar lugar</h2>
            <p className="confirm-modal__lead">
              Vas a eliminar <strong>«{name}»</strong> de forma permanente. Esta acción{' '}
              <strong>no se puede deshacer</strong> y borra su ficha, imágenes y datos asociados.
              Si solo querés ocultarlo, mejor archivalo.
            </p>
            <label className="confirm-modal__check">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={(e) => setConfirmChecked(e.target.checked)}
              />
              <span>Sí, entiendo que es permanente y quiero eliminar «{name}».</span>
            </label>
            <div className="confirm-modal__actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setConfirmOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--sm confirm-modal__delete"
                disabled={!confirmChecked}
                onClick={doDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
