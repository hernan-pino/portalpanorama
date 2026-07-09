// El ID de medición de GA4. Si no está seteado, analytics queda apagado
// (el componente no renderiza nada). Se enciende solo poniendo NEXT_PUBLIC_GA_ID
// en el entorno (Vercel → Env Vars, Production).
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID

type GtagFn = (command: 'event', eventName: string, params?: Record<string, unknown>) => void

declare global {
  interface Window {
    gtag?: GtagFn
    dataLayer?: unknown[]
  }
}

/**
 * Envía un evento custom a GA4. Seguro de llamar desde cualquier componente
 * cliente: si GA está apagado (sin ID) o bloqueado por un adblock, no hace
 * nada. Nunca debe romper la UI por un tema de analítica.
 *
 * Encola directo en dataLayer (gtag() es azúcar sobre dataLayer.push): así los
 * eventos emitidos ANTES de que gtag.js cargue (estrategia lazyOnload) no se
 * pierden — GA procesa la cola apenas llega. Ojo: GA exige el objeto
 * `arguments` real, no un array; de ahí la función clásica.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || !gaMeasurementId) return
  try {
    window.dataLayer = window.dataLayer ?? []
    function gtag(..._args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
    if (params) gtag('event', eventName, params)
    else gtag('event', eventName)
  } catch {
    // Analítica nunca rompe el flujo del usuario.
  }
}
