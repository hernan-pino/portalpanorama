import Script from 'next/script'
import { gaMeasurementId } from '@lib/analytics'

// GA4 vía gtag.js. Carga `afterInteractive` para no bloquear el render.
// Si no hay ID configurado, no inyecta nada (analytics apagado por defecto).
export function GoogleAnalytics() {
  if (!gaMeasurementId) return null
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
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
