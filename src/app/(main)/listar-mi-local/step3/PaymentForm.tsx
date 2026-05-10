'use client'

import { useActionState } from 'react'
import { startSubscriptionAction, StartSubscriptionState } from '../actions'

export function PaymentForm({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState<StartSubscriptionState, FormData>(
    startSubscriptionAction,
    {},
  )

  return (
    <form action={action}>
      <input type="hidden" name="listingId" value={listingId} />
      {state.error && <p className="form-error-banner">{state.error}</p>}
      <button type="submit" className="btn btn--accent btn--lg" style={{ width: '100%' }} disabled={pending}>
        {pending ? 'Conectando con Flow...' : 'Ir al pago →'}
      </button>
    </form>
  )
}
