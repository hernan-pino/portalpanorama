import Script from 'next/script'
import { gaMeasurementId } from '@lib/analytics'

// GA4 vía gtag.js. Carga `lazyOnload` (cuando el navegador queda ocioso): gtag
// pesa ~160KiB y con afterInteractive bloqueaba el hilo justo durante el LCP
// móvil (~300ms de TBT). Los eventos no se pierden: trackEvent hace push a
// dataLayer y gtag los procesa al cargar.
// Si no hay ID configurado, no inyecta nada (analytics apagado por defecto).
export function GoogleAnalytics() {
  if (!gaMeasurementId) return null
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}');
        `}
      </Script>
    </>
  )
}
