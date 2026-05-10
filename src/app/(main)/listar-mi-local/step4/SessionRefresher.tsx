'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function SessionRefresher() {
  const { update } = useSession()
  useEffect(() => {
    update()
  }, [update])
  return null
}
