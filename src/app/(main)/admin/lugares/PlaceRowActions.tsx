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

  function run(action: () => Promise<ActionResult>) {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if ('error' in result) setError(result.error)
      else router.refresh()
    })
  }

  function confirmDelete() {
    // Borrado irreversible: doble confirmación con el nombre para no errarle a la fila.
    if (window.confirm(`¿Eliminar "${name}" de forma permanente?\n\nEsto no se puede deshacer. Si solo querés ocultarlo, usá Archivar.`)) {
      run(() => deletePlaceAction(id))
    }
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
        onClick={confirmDelete}>Eliminar</button>
      {error && <span className="admin-row-actions__error" role="alert">{error}</span>}
    </div>
  )
}
