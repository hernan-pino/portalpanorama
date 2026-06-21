'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { renameListAction, deleteListAction } from '@/app/actions/collections'

// Barra de gestión de una lista (renombrar / eliminar) en la vista de detalle.
// Renombrar refresca en sitio; eliminar vuelve a la grilla de Guardados.
export function ListManageBar({ collectionId, name }: { collectionId: string; name: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [value, setValue] = useState(name)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function save() {
    if (!value.trim()) return
    startTransition(async () => {
      const res = await renameListAction(collectionId, value)
      if ('error' in res) {
        setError(res.error)
        return
      }
      setEditing(false)
      setError(null)
      router.refresh()
    })
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteListAction(collectionId)
      if ('error' in res) {
        setError(res.error)
        return
      }
      router.push('/mi-cuenta?tab=guardados')
    })
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
          <input
            className="input"
            style={{ height: 40, maxWidth: 280 }}
            value={value}
            maxLength={60}
            autoFocus
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') {
                setEditing(false)
                setValue(name)
                setError(null)
              }
            }}
          />
          <button type="button" className="btn btn--primary btn--sm" disabled={isPending || !value.trim()} onClick={save}>
            Guardar
          </button>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={isPending}
            onClick={() => {
              setEditing(false)
              setValue(name)
              setError(null)
            }}
          >
            Cancelar
          </button>
        </div>
        {error && <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)' }}>{error}</p>}
      </div>
    )
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
        <div style={{ display: 'flex', gap: 'var(--s-2)', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>¿Eliminar esta lista?</span>
          <button type="button" className="btn btn--sm confirm-modal__delete" disabled={isPending} onClick={remove}>
            {isPending ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" disabled={isPending} onClick={() => setConfirming(false)}>
            Cancelar
          </button>
        </div>
        {error && <p style={{ color: 'var(--error)', fontSize: 'var(--t-body-sm)' }}>{error}</p>}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>
        Renombrar
      </button>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirming(true)}>
        Eliminar lista
      </button>
    </div>
  )
}
