import Link from 'next/link'
import type { ListingSubscriptionView } from '@application/subscription/GetListingSubscriptionsUseCase'
import { SubscriptionStatus } from '@domain/subscription/SubscriptionStatus'
import { StartSubscriptionButtonDash } from '../StartSubscriptionButtonDash'

export function TabPlan({ subscriptions }: { subscriptions: ListingSubscriptionView[] }) {
  if (subscriptions.length === 0) {
    return (
      <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-4)' }}>Plan</h1>
        <p style={{ color: 'var(--fg-muted)' }}>
          Primero necesitás crear una ficha para poder suscribirte a Premium.{' '}
          <Link href="/mi-negocio?tab=fichas" style={{ color: 'var(--fg-default)', fontWeight: 500 }}>Ver mis fichas →</Link>
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)', maxWidth: '640px' }}>
      <div style={{ marginBottom: 'var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>Plan</h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
          Gestioná el plan Premium de cada una de tus fichas.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
        {subscriptions.map(({ listing, subscription }) => {
          const isPremium = listing.isPremium()
          const isActive = subscription?.status === SubscriptionStatus.ACTIVE

          return (
            <div
              key={listing.id}
              style={{
                background: 'var(--bg-raised)',
                border: `1px solid ${isPremium ? 'var(--ink-100)' : 'var(--surface-line)'}`,
                borderRadius: 'var(--r-lg)',
                padding: 'var(--s-6)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--s-4)', marginBottom: 'var(--s-5)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--t-h4)', fontWeight: 500, marginBottom: 'var(--s-1)' }}>{listing.name}</h2>
                  <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>{listing.neighborhood}</p>
                </div>
                {isPremium ? (
                  <span className="premium-badge">Premium</span>
                ) : (
                  <span style={{ fontSize: 'var(--t-mono-sm)', fontFamily: 'var(--font-mono)', letterSpacing: 'var(--tr-wider)', textTransform: 'uppercase', color: 'var(--fg-muted)', padding: '2px 8px', border: '1px solid var(--surface-line)', borderRadius: 'var(--r-pill)' }}>
                    Free
                  </span>
                )}
              </div>

              {isActive && subscription ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
                  <InfoRow label="Estado" value={<span style={{ color: 'var(--success)', fontWeight: 500 }}>Activo</span>} />
                  {subscription.currentPeriodEnd && (
                    <InfoRow label="Próximo cobro" value={subscription.currentPeriodEnd.toLocaleDateString('es-CL')} />
                  )}
                </div>
              ) : !isPremium ? (
                <div>
                  <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)', marginBottom: 'var(--s-4)', lineHeight: 'var(--lh-loose)' }}>
                    Mejorá la visibilidad de tu ficha con fotos ilimitadas, posición destacada y estadísticas avanzadas.
                  </p>
                  <StartSubscriptionButtonDash listingId={listing.id} />
                </div>
              ) : (
                <p style={{ fontSize: 'var(--t-body-sm)', color: 'var(--fg-muted)' }}>Plan Premium activo.</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--t-body-sm)' }}>
      <span style={{ color: 'var(--fg-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}
