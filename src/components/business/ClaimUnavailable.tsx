import Link from 'next/link'
import type { ClaimEligibility } from '@application/business/GetClaimEligibilityUseCase'

interface Props {
  eligibility: Exclude<ClaimEligibility, 'FREE'>
  targetName: string
  /** Vuelta a la ficha o marca desde donde llegó. */
  backHref: string
}

/**
 * El reclamo no corresponde: en vez del formulario (que igual iba a fallar al enviar),
 * se explica por qué y se ofrece la salida que sirve en cada caso.
 */
export function ClaimUnavailable({ eligibility, targetName, backHref }: Props) {
  const content = {
    OWNED_BY_YOU: {
      title: `${targetName} ya es tuyo`,
      lead: 'Esta ficha está asociada a tu cuenta. Gestiónala desde tu panel: puedes corregir la información, actualizar el horario y subir fotos.',
      cta: { href: '/mi-negocio', label: 'Ir a mi panel' },
    },
    PENDING_YOURS: {
      title: 'Ya tienes una solicitud en revisión',
      lead: `Recibimos tu solicitud por ${targetName} y la estamos revisando a mano. Te avisamos por correo apenas quede lista — no necesitas volver a enviarla.`,
      cta: { href: '/mi-negocio', label: 'Ver en qué va' },
    },
    OWNED_BY_OTHER: {
      title: 'Esta ficha ya tiene dueño',
      lead: `${targetName} fue reclamado y verificado por su equipo. Si crees que es un error, escríbenos a hola@portalpanorama.cl y lo revisamos.`,
      cta: { href: '/para-negocios', label: 'Cómo funcionan las cuentas de negocio' },
    },
    MISSING: {
      title: 'Este negocio ya no existe',
      lead: 'La ficha que intentas reclamar ya no está disponible en Portal Panorama.',
      cta: { href: '/explorar', label: 'Explorar lugares' },
    },
  }[eligibility]

  return (
    <div className="legal container">
      <p className="eyebrow">Para negocios</p>
      <h1 className="display legal__title">{content.title}</h1>
      <p className="legal__lead">{content.lead}</p>
      <div className="claim-unavailable__actions">
        <Link href={content.cta.href} className="btn btn--primary">
          {content.cta.label}
        </Link>
        <Link href={backHref} className="btn btn--ghost">
          Volver
        </Link>
      </div>
    </div>
  )
}
