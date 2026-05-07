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

export default function PlanesPage() {
  return (
    <div className="page-enter">
      {/* Header */}
      <section
        className="container"
        style={{ paddingTop: 'var(--s-20)', paddingBottom: 'var(--s-12)', textAlign: 'center' }}
      >
        <p className="eyebrow" style={{ marginBottom: 'var(--s-4)' }}>Para tu negocio</p>
        <h1
          className="display"
          style={{ fontSize: 'var(--t-display-sm)', marginBottom: 'var(--s-5)' }}
        >
          Simple, <em>sin sorpresas.</em>
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-h4)', maxWidth: '480px', margin: '0 auto', lineHeight: 'var(--lh-loose)' }}>
          Empezá gratis. Subí a Premium cuando quieras más visibilidad.
        </p>
      </section>

      {/* Cards */}
      <section className="container" style={{ paddingBottom: 'var(--s-20)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--s-6)',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          {/* Free */}
          <div
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--surface-line)',
              borderRadius: 'var(--r-xl)',
              padding: 'var(--s-8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--s-6)',
            }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>Free</p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--t-display-sm)',
                  fontWeight: 400,
                  letterSpacing: 'var(--tr-tight)',
                  lineHeight: 1,
                }}
              >
                $0
              </p>
              <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', marginTop: 'var(--s-2)' }}>
                Para siempre
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', flex: 1 }}>
              {FREE_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 'var(--s-3)', fontSize: 'var(--t-body-sm)', alignItems: 'flex-start' }}>
                  <CheckIcon />
                  {f}
                </li>
              ))}
            </ul>

            <Link href="/registro" className="btn btn--ghost" style={{ justifyContent: 'center' }}>
              Empezar gratis
            </Link>
          </div>

          {/* Premium */}
          <div
            className="is-premium"
            style={{
              background: 'var(--ink-100)',
              color: 'var(--paper-00)',
              borderRadius: 'var(--r-xl)',
              padding: 'var(--s-8)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--s-6)',
            }}
          >
            <div>
              <p
                className="eyebrow"
                style={{ marginBottom: 'var(--s-3)', color: 'var(--paper-40)' }}
              >
                Premium
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--t-display-sm)',
                  fontWeight: 400,
                  letterSpacing: 'var(--tr-tight)',
                  lineHeight: 1,
                  color: 'var(--paper-00)',
                }}
              >
                A consultar
              </p>
              <p style={{ color: 'var(--paper-40)', fontSize: 'var(--t-body-sm)', marginTop: 'var(--s-2)' }}>
                por mes · cancela cuando quieras
              </p>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--s-3)', flex: 1 }}>
              {PREMIUM_FEATURES.map((f) => (
                <li key={f} style={{ display: 'flex', gap: 'var(--s-3)', fontSize: 'var(--t-body-sm)', alignItems: 'flex-start', color: 'var(--paper-10)' }}>
                  <CheckIcon color="var(--accent-50)" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/registro"
              className="btn btn--accent btn--lg"
              style={{ justifyContent: 'center' }}
            >
              Comenzar
            </Link>
          </div>
        </div>

        {/* FAQ mínimo */}
        <div style={{ maxWidth: '600px', margin: 'var(--s-16) auto 0', display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
          <h2
            className="display"
            style={{ fontSize: 'var(--t-h2)', textAlign: 'center', marginBottom: 'var(--s-2)' }}
          >
            Preguntas frecuentes
          </h2>
          {[
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
          ].map(({ q, a }) => (
            <div key={q} style={{ borderTop: '1px solid var(--surface-line)', paddingTop: 'var(--s-5)' }}>
              <p style={{ fontWeight: 500, marginBottom: 'var(--s-2)' }}>{q}</p>
              <p style={{ color: 'var(--fg-muted)', fontSize: 'var(--t-body-sm)', lineHeight: 'var(--lh-loose)' }}>{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function CheckIcon({ color = 'var(--success)' }: { color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: '2px' }}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
