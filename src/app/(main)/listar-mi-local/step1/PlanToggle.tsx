'use client'

import { useState } from 'react'
import Link from 'next/link'

const MONTHLY = 24900
const ANNUAL = 19900

export function PlanToggle() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const price = billing === 'monthly' ? MONTHLY : ANNUAL

  return (
    <div className="plans-toggle-wrap">
      <div className="plans-toggle">
        <button
          type="button"
          className={`plans-toggle__btn${billing === 'monthly' ? ' plans-toggle__btn--active' : ''}`}
          onClick={() => setBilling('monthly')}
        >
          Mensual
        </button>
        <button
          type="button"
          className={`plans-toggle__btn${billing === 'annual' ? ' plans-toggle__btn--active' : ''}`}
          onClick={() => setBilling('annual')}
        >
          Anual <span className="plans-toggle__badge">−20%</span>
        </button>
      </div>

      <div className="plans-grid">
        {/* Free */}
        <div className="plan">
          <div className="plan__header">
            <h2 className="plan__name">Free</h2>
            <div className="plan__price">
              <span className="plan__amount">$0</span>
              <span className="plan__period">para siempre</span>
            </div>
          </div>
          <ul className="plan__features">
            <li>Ficha básica</li>
            <li>3 fotos</li>
            <li>Aparece en búsquedas</li>
            <li>Reseñas de visitantes</li>
          </ul>
          <Link href="/listar-mi-local/step2?plan=free" className="btn btn--ghost btn--lg" style={{ width: '100%', justifyContent: 'center' }}>
            Crear ficha gratis →
          </Link>
        </div>

        {/* Premium */}
        <div className="plan plan--premium">
          <div className="plan__badge">Recomendado</div>
          <div className="plan__header">
            <h2 className="plan__name">Premium</h2>
            <div className="plan__price">
              <span className="plan__amount">${price.toLocaleString('es-CL')}</span>
              <span className="plan__period">/mes</span>
            </div>
          </div>
          <ul className="plan__features">
            <li>Todo lo de Free</li>
            <li>Galería ilimitada</li>
            <li>Posición prioritaria</li>
            <li>Estadísticas avanzadas</li>
            <li>Newsletter editorial</li>
            <li>Soporte prioritario</li>
          </ul>
          <Link href="/listar-mi-local/step2?plan=premium" className="btn btn--accent btn--lg" style={{ width: '100%', justifyContent: 'center' }}>
            Empezar 14 días gratis →
          </Link>
        </div>
      </div>

      <div className="checkout-trust">
        <span>✓ Sin comisiones por reservas</span>
        <span>✓ Cancela cuando quieras</span>
        <span>✓ Datos seguros · 256-bit</span>
      </div>
    </div>
  )
}
