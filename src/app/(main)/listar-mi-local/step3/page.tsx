import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@lib/auth'
import { PaymentForm } from './PaymentForm'

export const metadata: Metadata = { title: 'Pago — Listar mi local' }

export default async function Step3Page({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string }>
}) {
  const session = await auth()
  const { listingId } = await searchParams

  if (!session?.user || !listingId) redirect('/listar-mi-local/step1')

  return (
    <div className="checkout-step-content checkout-step-content--narrow">
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 4vw, 56px)',
          fontWeight: 400,
          letterSpacing: 'var(--tr-tight)',
          lineHeight: 1,
          marginBottom: 'var(--s-2)',
          fontVariationSettings: '"opsz" 100',
        }}
      >
        Configurar <em>pago</em>.
      </h1>
      <p style={{ color: 'var(--fg-muted)', marginBottom: 'var(--s-8)' }}>
        Serás redirigido a Flow para completar el pago. Sin comisiones ocultas.
      </p>

      <div className="plan plan--premium" style={{ marginBottom: 'var(--s-8)' }}>
        <div className="plan__header">
          <h2 className="plan__name">Premium</h2>
          <div className="plan__price">
            <span className="plan__amount">$24.900</span>
            <span className="plan__period">/mes</span>
          </div>
        </div>
        <ul className="plan__features">
          <li>Galería ilimitada</li>
          <li>Posición prioritaria</li>
          <li>Estadísticas avanzadas</li>
          <li>Cancela cuando quieras</li>
        </ul>
      </div>

      <PaymentForm listingId={listingId} />
    </div>
  )
}
