import type { Metadata } from 'next'
import { PlanToggle } from './PlanToggle'

export const metadata: Metadata = { title: 'Elige tu plan — Listar mi local' }

export default function Step1Page() {
  return (
    <div className="checkout-step-content">
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 5vw, 72px)',
          fontWeight: 400,
          letterSpacing: 'var(--tr-tight)',
          lineHeight: 1,
          marginBottom: 'var(--s-10)',
          fontVariationSettings: '"opsz" 144',
        }}
      >
        Elige tu <em>plan</em>.
      </h1>
      <PlanToggle />
    </div>
  )
}
