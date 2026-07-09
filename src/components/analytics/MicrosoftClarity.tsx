import Script from 'next/script'

// Microsoft Clarity (heatmaps + grabaciones de sesión). Carga `lazyOnload`
// (cuando el navegador queda ocioso) para no competir con el LCP móvil; su
// snippet encola en c.clarity.q, así que no pierde nada mientras carga.
// Si no hay Project ID configurado, no inyecta nada
// (apagado por defecto). Se enciende poniendo NEXT_PUBLIC_CLARITY_ID en el entorno
// (Vercel → Env Vars, Production). El ID se obtiene en clarity.microsoft.com.
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_ID

export function MicrosoftClarity() {
  if (!clarityProjectId) return null
  return (
    <Script id="ms-clarity-init" strategy="lazyOnload">
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityProjectId}");
      `}
    </Script>
  )
}
