import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { container } from '@lib/container'
import { SubscriptionStatus } from '@domain/subscription/SubscriptionStatus'
import { StartSubscriptionButton } from './StartSubscriptionButton'

export const metadata: Metadata = { title: 'Suscripción' }

export default async function SuscripcionPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { listings } = await container
    .getGetBusinessDashboardUseCase()
    .execute(session.user.id)

  if (listings.length === 0) {
    return (
      <div style={{ padding: 'var(--s-10) var(--s-8)' }}>
        <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-4)' }}>
          Suscripción
        </h1>
        <p style={{ color: 'var(--fg-muted)' }}>
          Primero necesitás crear un listing para poder suscribirte a Premium.
        </p>
      </div>
    )
  }

  const subRepo = container.getSubscriptionRepository()
  const subscriptionsData = await Promise.all(
    listings.map(async ({ listing }) => {
      const subscription = await subRepo.findByListingId(listing.id)
      return { listing, subscription }
    }),
  )

  return (
    <div style={{ padding: 'var(--s-10) var(--s-8)', maxWidth: '640px' }}>
      <h1 className="display" style={{ fontSize: 'var(--t-h1)', marginBottom: 'var(--s-2)' }}>
        Suscripción
      </h1>
      <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginBottom: 'var(--s-10)' }}>
        Gestioná el plan Premium de cada uno de tus listings.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
        {subscriptionsData.map(({ listing, subscription }) => {
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
                  <h2 style={{ fontSize: 'var(--t-h4)', fontWeight: 500, marginBottom: 'var(--s-1)' }}>
                    {listing.name}
                  </h2>
                  <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)' }}>
                    {listing.neighborhood}
                  </p>
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
                    Mejorá la visibilidad de tu listing con fotos ilimitadas, posición destacada y estadísticas.
                  </p>
                  <StartSubscriptionButton listingId={listing.id} />
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
