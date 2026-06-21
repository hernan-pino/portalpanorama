'use client'
import { useState } from 'react'
import { ShareIcon } from './icons'

interface Props {
  name: string
  variant: 'button' | 'fab'
}

type ShareTarget =
  | { key: string; label: string; kind: 'open'; href: string; icon: React.ReactNode }
  | { key: string; label: string; kind: 'email'; href: string; icon: React.ReactNode }
  | { key: string; label: string; kind: 'copy'; hint: string; icon: React.ReactNode }

function buildTargets(name: string, url: string): ShareTarget[] {
  const t = encodeURIComponent(name)
  const u = encodeURIComponent(url)
  const tu = encodeURIComponent(`${name} ${url}`)
  return [
    { key: 'whatsapp', label: 'WhatsApp', kind: 'open', href: `https://wa.me/?text=${tu}`, icon: <WhatsAppGlyph /> },
    { key: 'x', label: 'X', kind: 'open', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}`, icon: <XGlyph /> },
    { key: 'telegram', label: 'Telegram', kind: 'open', href: `https://t.me/share/url?url=${u}&text=${t}`, icon: <TelegramGlyph /> },
    { key: 'facebook', label: 'Facebook', kind: 'open', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <FacebookGlyph /> },
    { key: 'email', label: 'Email', kind: 'email', href: `mailto:?subject=${t}&body=${encodeURIComponent(`${name}\n${url}`)}`, icon: <EmailGlyph /> },
    { key: 'copy', label: 'Copiar link', kind: 'copy', hint: 'Link copiado', icon: <LinkGlyph /> },
    // Instagram y TikTok no exponen API web para pre-cargar un link externo → copiamos
    // el link y avisamos para que la persona lo pegue en su historia/bio.
    { key: 'instagram', label: 'Instagram', kind: 'copy', hint: 'Link copiado — pégalo en tu historia o bio', icon: <InstagramGlyph /> },
    { key: 'tiktok', label: 'TikTok', kind: 'copy', hint: 'Link copiado — pégalo en tu bio o DM', icon: <TikTokGlyph /> },
  ]
}

export function ShareButton({ name, variant }: Props) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  // La URL se resuelve al abrir (cliente): apunta a la ficha actual.
  const [targets, setTargets] = useState<ShareTarget[]>([])

  function openModal() {
    setTargets(buildTargets(name, window.location.href))
    setFeedback(null)
    setOpen(true)
  }
  function close() {
    setOpen(false)
    setFeedback(null)
  }

  async function pick(target: ShareTarget) {
    if (target.kind === 'open') {
      window.open(target.href, '_blank', 'noopener,noreferrer')
      close()
      return
    }
    if (target.kind === 'email') {
      window.location.href = target.href
      close()
      return
    }
    // copy
    try {
      await navigator.clipboard.writeText(window.location.href)
      setFeedback(target.hint)
    } catch {
      setFeedback('No se pudo copiar el link.')
    }
  }

  return (
    <>
      {variant === 'fab' ? (
        <button type="button" className="ficha__fab" aria-label="Compartir" onClick={openModal}>
          <ShareIcon />
        </button>
      ) : (
        <button type="button" className="btn btn--ghost btn--icon" aria-label="Compartir" onClick={openModal}>
          <ShareIcon />
        </button>
      )}

      {open && (
        <div className="save-modal__scrim" role="presentation" onClick={close}>
          <div
            className="save-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Compartir lugar"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="save-modal__title">Compartir este lugar</h4>

            <div className="share-grid">
              {targets.map((target) => (
                <button key={target.key} type="button" className="share-opt" onClick={() => pick(target)}>
                  <span className="share-opt__ico">{target.icon}</span>
                  <span>{target.label}</span>
                </button>
              ))}
            </div>

            {feedback && <p className="share-modal__feedback">{feedback}</p>}
          </div>
        </div>
      )}
    </>
  )
}

// ── Glifos de marca (trazo simple, currentColor) ──
function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17l1.1-3.3A6.5 6.5 0 1 1 7 16.4z" />
      <path d="M7.4 7.2c.2-.5.4-.5.7-.5h.4c.2 0 .4 0 .5.4l.5 1.2c0 .2 0 .3-.1.4l-.4.5c-.1.1-.2.3 0 .5a4.6 4.6 0 0 0 2 1.8c.2.1.4.1.5 0l.5-.6c.1-.2.3-.2.5-.1l1.2.6c.2.1.3.2.3.4 0 .6-.3 1.1-.9 1.3-.5.2-1.2.2-2.6-.4a7 7 0 0 1-3.3-3.3c-.4-.9-.5-1.6-.3-2.1z" fill="currentColor" stroke="none" />
    </svg>
  )
}
function XGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M11.9 8.6L17.3 2.5h-1.6l-4.6 5.3-3.7-5.3H3l5.7 8.2L3 17.5h1.6l4.9-5.7 3.9 5.7H18zm-1.7 2l-.6-.8L5.1 3.7h2.1l3.7 5.2.6.8 4.7 6.7h-2.1z" />
    </svg>
  )
}
function TelegramGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 4L2.8 9.5c-.6.2-.6.6 0 .8l3.5 1.1L14 6.3 7.8 12l-.2 3.2c.4 0 .6-.2.8-.4l1.9-1.8 3.6 2.7c.7.4 1.1.2 1.3-.6L17.8 4.9c.2-.9-.3-1.3-.8-.9z" />
    </svg>
  )
}
function FacebookGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12 10.3h1.9l.3-2.3H12V6.5c0-.7.2-1.1 1.2-1.1h1.1V3.3c-.2 0-.9-.1-1.6-.1-1.7 0-2.8 1-2.8 2.9V8H8v2.3h1.9V17H12z" />
    </svg>
  )
}
function EmailGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2" />
      <path d="M3 6l7 4.5L17 6" />
    </svg>
  )
}
function LinkGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.3-2.3a3 3 0 0 0-4.2-4.2l-1 1" />
      <path d="M11.5 8.5a3 3 0 0 0-4.2 0L5 10.8a3 3 0 0 0 4.2 4.2l1-1" />
    </svg>
  )
}
function InstagramGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="4.2" />
      <circle cx="10" cy="10" r="3.2" />
      <circle cx="14.1" cy="5.9" r="0.6" fill="currentColor" />
    </svg>
  )
}
function TikTokGlyph() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M13 2.5c.3 1.8 1.4 3 3.2 3.2v2.1c-1.1 0-2.1-.3-3.1-.9v4.6a4.6 4.6 0 1 1-4.6-4.6c.2 0 .5 0 .7.1v2.2a2.4 2.4 0 1 0 1.7 2.3V2.5z" />
    </svg>
  )
}
