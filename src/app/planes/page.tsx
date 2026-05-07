import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Planes para tu negocio' }

const FREE_FEATURES = [
  'Ficha básica con nombre, dirección y descripción',
  'Hasta 3 fotos',
  'Categoría y barrio',
  'Reseñas de usuarios',
  'Aparece en búsquedas',
]

const PREMIUM_FEATURES = [
  'Todo lo del plan Free',
  'Fotos ilimitadas',
  'Destacado en resultados de búsqueda',
  'Badge Premium visible',
  'Estadísticas de visitas y clicks',
  'Etiquetas adicionales (tags)',
  'Soporte prioritario',
]

const FAQ = [
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí. Podés subir o bajar de plan cuando quieras. Los cambios se aplican al siguiente ciclo de facturación.',
  },
  {
    q: '¿Cómo funciona el pago?',
    a: 'Usamos Flow para procesar pagos en Chile. Podés pagar con tarjeta de crédito o débito.',
  },
  {
    q: '¿El plan Free tiene límite de tiempo?',
    a: 'No. El plan Free es permanente y sin tarjeta de crédito requerida.',
  },
]

export default function PlanesPage() {
  return (
    <div className="page-enter">

      {/* ── Header ── */}
      <section className="container" style={{ paddingTop: 'var(--s-20)', paddingBottom: 'var(--s-4)', textAlign: 'center' }}>
        <p className="eyebrow" style={{ marginBottom: 'var(--s-4)' }}>Para tu negocio</p>
        <h1
          className="display"
          style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 400, letterSpacing: 'var(--tr-tight)', lineHeight: 0.95, margin: '0 auto', maxWidth: '700px' }}
        >
          Simple, <em>sin sorpresas.</em>
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-h4)', maxWidth: '440px', margin: 'var(--s-5) auto 0', lineHeight: 'var(--lh-loose)' }}>
          Empezá gratis. Subí a Premium cuando quieras más visibilidad.
        </p>
      </section>

      {/* ── Plan cards ── */}
      <section className="container" style={{ paddingBottom: 'var(--s-20)' }}>
        <div className="plans-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Free */}
          <div className="plan">
            <h3>Free</h3>
            <div className="plan__price">
              <span className="num">$0</span>
              <span className="unit">/ para siempre</span>
            </div>
            <ul className="plan-list">
              {FREE_FEATURES.map((f) => (
                <li key={f}>
                  <CheckIcon className="ico" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/registro" className="btn btn--ghost" style={{ justifyContent: 'center', marginTop: 'auto' }}>
              Empezar gratis
            </Link>
          </div>

          {/* Premium */}
          <div className="plan plan--premium">
            <h3><em>Premium</em></h3>
            <div className="plan__price">
              <span className="num">$</span>
              <span className="unit">a consultar / mes</span>
            </div>
            <ul className="plan-list">
              {PREMIUM_FEATURES.map((f) => (
                <li key={f}>
                  <CheckIcon className="ico" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/registro" className="btn btn--accent btn--lg" style={{ justifyContent: 'center', marginTop: 'auto' }}>
              Comenzar
            </Link>
          </div>

        </div>

        {/* ── FAQ ── */}
        <div style={{ maxWidth: '600px', margin: 'var(--s-20) auto 0' }}>
          <h2
            className="display"
            style={{ fontSize: 'var(--t-h2)', textAlign: 'center', marginBottom: 'var(--s-8)' }}
          >
            Preguntas frecuentes
          </h2>
          {FAQ.map(({ q, a }) => (
            <div key={q} style={{ borderTop: '1px solid var(--surface-line)', paddingTop: 'var(--s-5)', paddingBottom: 'var(--s-5)' }}>
              <p style={{ fontWeight: 500, marginBottom: 'var(--s-2)' }}>{q}</p>
              <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', lineHeight: 'var(--lh-loose)' }}>{a}</p>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--surface-line)' }} />
        </div>
      </section>

    </div>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
