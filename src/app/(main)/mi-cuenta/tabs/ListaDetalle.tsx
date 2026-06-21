import Link from 'next/link'
import { PlaceCard, type SaveContext } from '@components/place/PlaceCard'
import type { UserCollectionDetailView } from '@application/ports/CollectionRepository'
import { ListManageBar } from './ListManageBar'
import { RemoveFromListButton } from './RemoveFromListButton'

// Detalle de una lista guardada: sus lugares como PlaceCards + gestión (renombrar/
// eliminar la lista, quitar lugares). El corazón de cada tarjeta sigue activo para
// guardar en otras listas.
export function TabListaDetalle({
  collection,
  save,
}: {
  collection: UserCollectionDetailView
  save: SaveContext
}) {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <Link
        href="/mi-cuenta?tab=guardados"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--s-1)',
          color: 'var(--fg-muted)',
          fontSize: 'var(--t-body-sm)',
          textDecoration: 'none',
          marginBottom: 'var(--s-6)',
        }}
      >
        ← Guardados
      </Link>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--s-4)',
          flexWrap: 'wrap',
          marginBottom: 'var(--s-8)',
        }}
      >
        <div>
          <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-1)' }}>
            {collection.name}
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', color: 'var(--fg-muted)' }}>
            {collection.itemCount} {collection.itemCount === 1 ? 'lugar' : 'lugares'}
          </p>
        </div>
        <ListManageBar collectionId={collection.id} name={collection.name} />
      </div>

      {collection.places.length === 0 ? (
        <div
          style={{
            border: '1px dashed var(--surface-line)',
            borderRadius: 'var(--r-lg)',
            padding: 'var(--s-10)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--s-3)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>Esta lista está vacía</p>
          <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', maxWidth: 280 }}>
            Guarda lugares con el corazón mientras exploras.
          </p>
          <Link href="/explorar" className="btn btn--ghost" style={{ marginTop: 'var(--s-2)' }}>
            Explorar →
          </Link>
        </div>
      ) : (
        <div className="results-list">
          {collection.places.map((place) => (
            <div key={place.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <PlaceCard place={place} save={save} variant="list" />
              <RemoveFromListButton collectionId={collection.id} placeId={place.id} placeName={place.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
