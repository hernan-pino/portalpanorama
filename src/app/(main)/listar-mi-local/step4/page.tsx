import type { Metadata } from 'next'
import Link from 'next/link'
import { SessionRefresher } from './SessionRefresher'

export const metadata: Metadata = { title: '¡Listo! — Listar mi local' }

export default async function Step4Page({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; listingId?: string }>
}) {
  const { plan } = await searchParams
  const isPremium = plan === 'premium'

  return (
    <div className="checkout-step-content checkout-step-content--narrow" style={{ textAlign: 'center', paddingTop: 'var(--s-8)' }}>
      <SessionRefresher />

      <div style={{ fontSize: '48px', marginBottom: 'var(--s-6)' }}>🎉</div>

      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 4vw, 64px)',
          fontWeight: 400,
          letterSpacing: 'var(--tr-tight)',
          lineHeight: 1,
          marginBottom: 'var(--s-4)',
          fontVariationSettings: '"opsz" 144',
        }}
      >
        {isPremium ? '¡Tu plan Premium está activo!' : '¡Tu ficha fue creada!'}
      </h1>

      <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-lg)', marginBottom: 'var(--s-10)', maxWidth: '480px', margin: '0 auto var(--s-10)' }}>
        {isPremium
          ? 'Tienes 14 días de prueba sin costo. Completa tu ficha desde el panel para empezar a recibir visitas.'
          : 'Tu ficha está en borrador. Complétala desde tu panel y publícala cuando estés listo.'}
      </p>

      <Link href="/mi-negocio" className="btn btn--primary btn--lg">
        Ir a mi panel →
      </Link>
    </div>
  )
}
