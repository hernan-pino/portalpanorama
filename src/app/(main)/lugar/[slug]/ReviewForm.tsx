'use client'
import { useRef, useState, useTransition } from 'react'
import { submitReviewAction } from './actions'

interface Props {
  slug: string
  isLoggedIn: boolean
  hasReviewed: boolean
}

export function ReviewForm({ slug, isLoggedIn, hasReviewed }: Props) {
  const [rating, setRating] = useState(8)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  if (!isLoggedIn) {
    return (
      <div style={{
        padding: 'var(--s-6)',
        background: 'var(--bg-sunken)',
        borderRadius: 'var(--r-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--s-4)',
        flexWrap: 'wrap',
      }}>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
          ¿Conocés este lugar?
        </p>
        <a href="/login" className="btn btn--primary btn--sm">
          Iniciá sesión para opinar
        </a>
      </div>
    )
  }

  if (hasReviewed || success) {
    return (
      <div style={{
        padding: 'var(--s-6)',
        background: 'var(--bg-sunken)',
        borderRadius: 'var(--r-md)',
      }}>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
          {success ? '¡Gracias! Tu reseña fue publicada.' : 'Ya dejaste una reseña para este lugar.'}
        </p>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setError(null)
    startTransition(async () => {
      const result = await submitReviewAction(formData)
      if ('error' in result) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      style={{
        padding: 'var(--s-6)',
        background: 'var(--bg-sunken)',
        borderRadius: 'var(--r-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-5)',
      }}
    >
      <input type="hidden" name="slug" value={slug} />

      <div>
        <label style={{
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--t-mono-sm)',
          letterSpacing: 'var(--tr-wide)',
          textTransform: 'uppercase',
          color: 'var(--fg-muted)',
          marginBottom: 'var(--s-3)',
        }}>
          Puntaje: <strong style={{ color: 'var(--fg-base)', fontSize: 'var(--t-body)' }}>{rating}/10</strong>
        </label>
        <input
          type="range"
          name="rating"
          min={1}
          max={10}
          step={1}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-60)' }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--t-mono-sm)',
          color: 'var(--fg-subtle)',
          marginTop: 'var(--s-1)',
        }}>
          <span>1</span>
          <span>10</span>
        </div>
      </div>

      <div>
        <label
          htmlFor="review-body"
          style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--t-mono-sm)',
            letterSpacing: 'var(--tr-wide)',
            textTransform: 'uppercase',
            color: 'var(--fg-muted)',
            marginBottom: 'var(--s-3)',
          }}
        >
          Tu opinión
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={4}
          placeholder="Contá tu experiencia en este lugar..."
          required
          minLength={10}
          maxLength={1000}
          style={{
            width: '100%',
            padding: 'var(--s-3) var(--s-4)',
            background: 'var(--bg-base)',
            border: '1px solid var(--surface-line)',
            borderRadius: 'var(--r-md)',
            color: 'var(--fg-base)',
            fontSize: 'var(--t-body-sm)',
            lineHeight: 'var(--lh-loose)',
            resize: 'vertical',
            fontFamily: 'var(--font-sans)',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {error && (
        <p style={{ color: 'var(--error, #c0392b)', fontSize: 'var(--t-body-sm)', margin: 0 }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn--primary btn--sm"
        style={{ alignSelf: 'flex-start' }}
      >
        {isPending ? 'Enviando...' : 'Publicar reseña'}
      </button>
    </form>
  )
}
