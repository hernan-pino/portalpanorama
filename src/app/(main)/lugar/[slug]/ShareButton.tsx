'use client'
import { useState } from 'react'
import { ShareIcon } from './icons'

interface Props {
  name: string
  variant: 'button' | 'fab'
}

export function ShareButton({ name, variant }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url })
        return
      } catch {
        // cancelado o no permitido → cae al copiado
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* sin clipboard: no-op */
    }
  }

  if (variant === 'fab') {
    return (
      <button type="button" className="ficha__fab" aria-label="Compartir" onClick={handleShare}>
        <ShareIcon />
      </button>
    )
  }

  return (
    <button type="button" className="btn btn--ghost btn--icon" aria-label="Compartir" onClick={handleShare}>
      <ShareIcon />
      {copied && (
        <span className="toast">Link copiado</span>
      )}
    </button>
  )
}
