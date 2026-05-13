'use client'
import { useState, useTransition } from 'react'
import { toggleFavoriteAction } from './actions'

interface Props {
  listingId: string
  slug: string
  initialIsFavorite: boolean
  isLoggedIn: boolean
}

export function FavoriteButton({ listingId, slug, initialIsFavorite, isLoggedIn }: Props) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      window.location.href = '/login'
      return
    }
    const next = !isFavorite
    setIsFavorite(next) // optimistic
    startTransition(async () => {
      const result = await toggleFavoriteAction(listingId, slug, !next)
      if ('error' in result) {
        setIsFavorite(!next) // revert on error
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="btn btn--ghost btn--sm"
      aria-label={isFavorite ? 'Quitar de guardados' : 'Guardar lugar'}
      style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)', justifyContent: 'center' }}
    >
      <HeartIcon filled={isFavorite} />
      {isFavorite ? 'Guardado' : 'Guardar'}
    </button>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'var(--accent-60)' : 'none'}
      stroke="var(--accent-60)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
