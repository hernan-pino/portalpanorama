'use client'
import { useTransition } from 'react'
import { publishListingAction } from './actions'

export function PublishButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await publishListingAction(listingId)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="btn btn--accent btn--sm"
      style={{ flexShrink: 0 }}
    >
      {pending ? 'Publicando…' : 'Publicar'}
    </button>
  )
}
