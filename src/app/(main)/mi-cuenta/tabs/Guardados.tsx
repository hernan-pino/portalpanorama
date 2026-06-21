import Link from 'next/link'
import Image from 'next/image'
import type { CollectionSummary } from '@application/ports/CollectionRepository'

export function TabGuardados({ collections }: { collections: CollectionSummary[] }) {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)' }}>
          Lugares <em>guardados</em>
        </h1>
      </div>

      {collections.length === 0 ? (
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
          <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
            Todavía no tienes listas
          </p>
          <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', maxWidth: 280 }}>
            Guarda lugares en listas (Citas, Con los cabros…) para tenerlos a mano.
          </p>
          <Link href="/explorar" className="btn btn--ghost" style={{ marginTop: 'var(--s-2)' }}>
            Explorar →
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 'var(--s-5)',
          }}
        >
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/mi-cuenta?tab=guardados&lista=${collection.id}`}
              style={{
                display: 'block',
                background: 'var(--bg-raised)',
                border: '1px solid var(--surface-line)',
                borderRadius: 'var(--r-lg)',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '16 / 10', background: 'var(--bg-sunken)' }}>
                {collection.coverUrl && (
                  <Image src={collection.coverUrl} alt={collection.name} fill style={{ objectFit: 'cover' }} />
                )}
              </div>
              <div style={{ padding: 'var(--s-4) var(--s-5)' }}>
                <p style={{ fontWeight: 500, fontSize: 'var(--t-body)', marginBottom: 'var(--s-1)' }}>
                  {collection.name}
                </p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--t-mono-sm)', color: 'var(--fg-muted)' }}>
                  {collection.itemCount} {collection.itemCount === 1 ? 'lugar' : 'lugares'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
