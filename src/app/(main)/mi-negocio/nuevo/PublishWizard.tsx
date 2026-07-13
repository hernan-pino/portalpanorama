'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AccountStep } from './AccountStep'
import { SeedForm, type CategoryOption, type CommuneOption } from './SeedForm'

const STEPS = ['Tu cuenta', 'Datos del negocio', 'Listo'] as const

// Onboarding de "Publica tu negocio" en UNA sola página: cuenta → datos → listo, sin
// recargar entre pasos. Quien ya tiene sesión entra directo al paso 2 (su cuenta ya
// está resuelta) y nunca ve el paso 1.
export function PublishWizard({
  isAuthenticated,
  googleEnabled,
  googleButton,
  categories,
  communes,
}: {
  isAuthenticated: boolean
  googleEnabled: boolean
  googleButton: React.ReactNode
  categories: CategoryOption[]
  communes: CommuneOption[]
}) {
  const router = useRouter()
  const [step, setStep] = useState(isAuthenticated ? 1 : 0)
  const topRef = useRef<HTMLOListElement>(null)

  // Sin navegación no hay scroll automático: al avanzar, el paso nuevo aparecía
  // fuera de pantalla (quedabas mirando el pie de página del paso anterior).
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  function handleAccountDone() {
    // La sesión ya existe (la cookie viajó en la respuesta de la action), pero el
    // header y demás server components todavía la ignoran: refrescarlos evita que el
    // sitio siga mostrando "Iniciar sesión" mientras el dueño llena su ficha.
    router.refresh()
    setStep(1)
  }

  return (
    <>
      <ol className="wizard-steps" aria-label="Pasos para publicar tu negocio" ref={topRef}>
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`wizard-steps__item${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}
            aria-current={i === step ? 'step' : undefined}
          >
            <span className="wizard-steps__num">{i < step ? '✓' : i + 1}</span>
            <span className="wizard-steps__label">{label}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <AccountStep
          googleEnabled={googleEnabled}
          googleButton={googleButton}
          onDone={handleAccountDone}
        />
      )}

      {step === 1 && (
        <div className="wizard-panel">
          <h2 className="wizard-panel__title">Cuéntanos de tu local</h2>
          <p className="wizard-panel__sub">
            Solo lo básico: con eso <strong>nosotros investigamos tu negocio y armamos su ficha
            completa</strong> (fotos, descripción, horario, cómo llegar) y la publicamos. Si algo
            nos queda mal, <strong>tú mismo lo corriges</strong> después desde tu panel.
          </p>
          <SeedForm categories={categories} communes={communes} onDone={() => setStep(2)} />
        </div>
      )}

      {step === 2 && (
        <div className="wizard-panel wizard-done">
          <p className="wizard-done__check" aria-hidden="true">✓</p>
          <h2 className="wizard-done__title">¡Listo! Recibimos tu negocio</h2>

          {/* Lo único que depende de él va primero y destacado: sin esto, su ficha no avanza. */}
          <div className="wizard-todo">
            <p className="wizard-todo__label">Te toca a ti — 1 paso</p>
            <p className="wizard-todo__action">
              Escríbenos <strong>desde el Instagram oficial de tu local</strong> a{' '}
              <a href="https://instagram.com/portalpanorama.cl" target="_blank" rel="noopener noreferrer">@portalpanorama.cl</a>
            </p>
            <p className="wizard-todo__alt">
              ¿No tienes Instagram? Manda un correo desde el correo del negocio a{' '}
              <a href="mailto:hola@portalpanorama.cl">hola@portalpanorama.cl</a>.
            </p>
            <p className="wizard-todo__why">Así confirmamos que el negocio es tuyo y nadie más puede reclamarlo.</p>
          </div>

          <ol className="wizard-next">
            <li><strong>Armamos tu ficha.</strong> Investigamos tu negocio y le sumamos fotos, descripción, horario y cómo llegar.</li>
            <li><strong>Te verificamos</strong> con el mensaje que nos mandaste, y te avisamos por correo.</li>
            <li><strong>La publicamos</strong> y queda en tu panel: desde ahí la editas cuando quieras.</li>
          </ol>

          <div className="wizard-done__actions">
            <Link href="/mi-negocio?enviada=1" className="btn btn--primary">Ir a mi panel</Link>
            <Link href="/explorar" className="btn btn--ghost">Ver el portal</Link>
          </div>
        </div>
      )}
    </>
  )
}
