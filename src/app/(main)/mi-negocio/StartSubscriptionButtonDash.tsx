'use client'
import { useTransition } from 'react'
import { startSubscriptionAction } from '../dashboard/suscripcion/actions'

export function StartSubscriptionButtonDash({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await startSubscriptionAction(listingId)
      if (result?.error) alert(result.error)
    })
  }

  return (
    <button onClick={handleClick} disabled={pending} className="btn btn--accent">
      {pending ? 'Redirigiendo a Flow…' : 'Suscribirse a Premium'}
    </button>
  )
}
