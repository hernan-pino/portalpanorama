'use client'
import { useState } from 'react'
import { BookmarkIcon } from './icons'
import { Toast } from '@components/ui/Toast'
import { SaveModal, type SaveCollection } from '@components/place/SaveModal'

interface Props {
  placeId: string
  placeName: string
  isLoggedIn: boolean
  isSaved: boolean
  savedInIds: string[]
  collections: SaveCollection[]
  defaultCollectionId: string | null
  defaultName: string
  /** Ficha a la que volver tras iniciar sesión (si no, el lugar se pierde en el camino). */
  returnTo: string
}

// Botón "Guardar" de la ficha. Se usa dos veces: en los CTAs del encabezado y en la
// barra fija de móvil. Abre el mismo modal centrado del corazón (SaveModal) — antes
// desplegaba un popover anclado bajo el botón, que en la barra de abajo se dibujaba
// fuera de pantalla; y sin sesión mandaba derecho al login, sin avisar por qué.
export function SaveButton({
  placeId, placeName, isLoggedIn, isSaved, savedInIds, collections, defaultCollectionId, defaultName, returnTo,
}: Props) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(isSaved)
  const [savedIn, setSavedIn] = useState<string | null>(null)
  const [inIds, setInIds] = useState(savedInIds)
  const [toast, setToast] = useState<string | null>(null)

  const label = savedIn ? `Guardado en ${savedIn}` : saved ? 'Guardado' : 'Guardar'

  return (
    <div style={{ flex: 1 }}>
      <button
        type="button"
        className="btn btn--accent"
        style={{ width: '100%', justifyContent: 'center' }}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <BookmarkIcon /> {label}
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
          origen="ficha"
          onClose={() => setOpen(false)}
          onSaved={({ collectionId, message, listName }) => {
            setSaved(true)
            setSavedIn(listName)
            if (collectionId) setInIds((ids) => (ids.includes(collectionId) ? ids : [...ids, collectionId]))
            setToast(message)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
