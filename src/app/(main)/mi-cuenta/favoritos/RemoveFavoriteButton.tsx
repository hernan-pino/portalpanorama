'use client'
import { useTransition } from 'react'
import { removeFavoriteAction } from './actions'

export function RemoveFavoriteButton({ listingId }: { listingId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await removeFavoriteAction(listingId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="btn btn--ghost btn--sm"
      style={{ color: 'var(--fg-muted)' }}
    >
      {isPending ? 'Eliminando…' : 'Quitar'}
    </button>
  )
}
