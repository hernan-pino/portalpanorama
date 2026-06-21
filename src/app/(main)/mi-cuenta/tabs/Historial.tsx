import Link from 'next/link'
import { PlaceCard } from '@components/place/PlaceCard'
import type { PlaceCardView } from '@application/ports/PlaceRepository'

// Lugares vistos recientemente (read-model del dashboard). Las tarjetas van sin
// corazón: el historial es una vista de solo lectura.
export function TabHistorial({ history }: { history: PlaceCardView[] }) {
  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
          Lugares <em>visitados</em>
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Los lugares que viste recientemente.
        </p>
      </div>

      {history.length === 0 ? (
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
            Todavía no visitaste ningún lugar
          </p>
          <p style={{ color: 'var(--fg-subtle)', fontSize: 'var(--t-body-sm)', maxWidth: 280 }}>
            Los lugares que abras van a aparecer acá.
          </p>
          <Link href="/explorar" className="btn btn--ghost" style={{ marginTop: 'var(--s-2)' }}>
            Explorar →
          </Link>
        </div>
      ) : (
        <div className="results-grid">
          {history.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      )}
    </div>
  )
}
