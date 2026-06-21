'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { removeFromListAction } from '@/app/actions/collections'

// Quita un lugar de ESTA lista (sigue guardado en otras listas donde esté). Tras
// la acción refresca la página para que el server vuelva a armar la grilla sin él.
export function RemoveFromListButton({
  collectionId,
  placeId,
  placeName,
}: {
  collectionId: string
  placeId: string
  placeName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function remove() {
    startTransition(async () => {
      const res = await removeFromListAction(collectionId, placeId)
      if ('success' in res) router.refresh()
    })
  }

  return (
    <button
      type="button"
      className="btn btn--ghost btn--sm"
      style={{ alignSelf: 'flex-start', marginTop: 'var(--s-2)' }}
      disabled={isPending}
      onClick={remove}
      aria-label={`Quitar ${placeName} de la lista`}
    >
      {isPending ? 'Quitando…' : 'Quitar de la lista'}
    </button>
  )
}
