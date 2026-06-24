'use client'
import { Suspense, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { trackEvent } from '@lib/analytics'

// Dispara el evento `login` de GA4 cuando se llega con ?ingreso=1 (lo agrega el
// login al redirigir tras autenticar) y limpia el query para no re-disparar en un
// refresh. Va aparte del registro, que usa sign_up desde el modal de bienvenida.
function Inner() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (params.get('ingreso') !== '1') return
    trackEvent('login', { method: 'email' })
    const next = new URLSearchParams(params.toString())
    next.delete('ingreso')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [params, pathname, router])

  return null
}

export function LoginEventTracker() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
