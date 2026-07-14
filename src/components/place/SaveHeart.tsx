'use client'
import { useState } from 'react'
import { Toast } from '@components/ui/Toast'
import { SaveModal, type SaveCollection } from './SaveModal'

interface Props {
  placeId: string
  placeName: string
  isLoggedIn: boolean
  isSaved: boolean
  savedInIds: string[]
  collections: SaveCollection[]
  defaultCollectionId: string | null
  defaultName: string
}

// Corazón de guardar sobre la tarjeta. Abre el modal único de guardar (SaveModal):
// visitante anónimo → invitación a entrar/registrarse conservando el lugar; usuario
// → sus listas. El corazón arranca relleno si el lugar ya está guardado en alguna
// lista, y guardar confirma con un toast.
export function SaveHeart({
  placeId, placeName, isLoggedIn, isSaved, savedInIds, collections, defaultCollectionId, defaultName,
}: Props) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(isSaved)
  const [inIds, setInIds] = useState(savedInIds)
  const [toast, setToast] = useState<string | null>(null)
  // A dónde volver si el visitante anónimo entra a su cuenta desde acá: sin esto,
  // el login lo dejaba en /explorar y el lugar que quería guardar se perdía.
  const [returnTo, setReturnTo] = useState('/')

  function onHeartClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setReturnTo(window.location.pathname + window.location.search)
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        className={`save-heart${saved ? ' is-saved' : ''}`}
        aria-label={saved ? `${placeName} guardado` : `Guardar ${placeName}`}
        aria-pressed={saved}
        onClick={onHeartClick}
      >
        <HeartGlyph filled={saved} />
      </button>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {open && (
        <SaveModal
          placeId={placeId}
          placeName={placeName}
          isLoggedIn={isLoggedIn}
          savedInIds={inIds}
          collections={collections}
          defaultCollectionId={defaultCollectionId}
          defaultName={defaultName}
          returnTo={returnTo}
          origen="tarjeta"
          onClose={() => setOpen(false)}
          onSaved={({ collectionId, message }) => {
            setSaved(true)
            if (collectionId) setInIds((ids) => (ids.includes(collectionId) ? ids : [...ids, collectionId]))
            setToast(message)
            setOpen(false)
          }}
        />
      )}
    </>
  )
}

function HeartGlyph({ filled }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 16.8S3 12.6 3 7.9A3.6 3.6 0 0 1 10 6.2 3.6 3.6 0 0 1 17 7.9c0 4.7-7 8.9-7 8.9z" />
    </svg>
  )
}
