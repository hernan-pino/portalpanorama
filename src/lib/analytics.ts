// El ID de medición de GA4. Si no está seteado, analytics queda apagado
// (el componente no renderiza nada). Se enciende solo poniendo NEXT_PUBLIC_GA_ID
// en el entorno (Vercel → Env Vars, Production).
export const gaMeasurementId = process.env.NEXT_PUBLIC_GA_ID

type GtagFn = (command: 'event', eventName: string, params?: Record<string, unknown>) => void

declare global {
  interface Window {
    gtag?: GtagFn
  }
}

/**
 * Envía un evento custom a GA4. Seguro de llamar desde cualquier componente
 * cliente: si GA no está cargado (sin ID, o bloqueado por un adblock), no hace
 * nada. Nunca debe romper la UI por un tema de analítica.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  try {
    window.gtag('event', eventName, params)
  } catch {
    // Analítica nunca rompe el flujo del usuario.
  }
}
