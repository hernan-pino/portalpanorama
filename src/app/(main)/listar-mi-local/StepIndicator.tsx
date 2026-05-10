'use client'

import { usePathname } from 'next/navigation'

const STEPS = [
  { n: 1, seg: 'step1', label: 'Elige tu plan' },
  { n: 2, seg: 'step2', label: 'Datos del negocio' },
  { n: 3, seg: 'step3', label: 'Pago' },
  { n: 4, seg: 'step4', label: 'Listo' },
]

export function StepIndicator() {
  const pathname = usePathname()
  const current = STEPS.find(s => pathname.includes(s.seg))?.n ?? 1

  return (
    <div className="checkout-steps">
      {STEPS.map((step, i) => {
        const done = step.n < current
        const active = step.n === current
        return (
          <div key={step.n} className={`checkout-step${active ? ' checkout-step--active' : ''}${done ? ' checkout-step--done' : ''}`}>
            <div className="checkout-step__track">
              <span className="checkout-step__num">{step.n}</span>
              {i < STEPS.length - 1 && <div className="checkout-step__line" />}
            </div>
            <span className="checkout-step__label">{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}
