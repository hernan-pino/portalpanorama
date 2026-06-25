import type { MetadataRoute } from 'next'
import { absoluteUrl, siteUrl } from '@lib/siteUrl'

const PRIVATE_PATHS = ['/admin', '/mi-cuenta', '/api', '/login', '/registro']

// Asistentes de IA que SÍ dejamos leer el texto (para aparecer cuando alguien le
// pregunta a ChatGPT/Perplexity/Claude/Gemini por panoramas), pero NO las fotos: les
// negamos /_next/image, que es por donde se sirven las imágenes optimizadas (las que se
// pagaron vía Apify/Blob). Estos bots reputados respetan robots.txt. 'Google-Extended'
// es el de IA de Google (Gemini), distinto de 'Googlebot' (búsqueda), que pasa por '*'.
const AI_ASSISTANTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'Google-Extended',
]

// Cosechadores de IA: solo entrenan/revenden sin mandar tráfico de vuelta. No los
// queremos en ninguna parte. 'GPTBot' es el de ENTRENAMIENTO de OpenAI (distinto de
// 'OAI-SearchBot', que sí cita y va arriba).
const AI_HARVESTERS = [
  'GPTBot',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'Diffbot',
  'ImagesiftBot',
  'Omgilibot',
  'Timpibot',
  'YouBot',
  'Meta-ExternalAgent',
  'Applebot-Extended',
  'cohere-ai',
]

// robots.txt: indexar lo público, bloquear panel/cuenta/auth/API. Apunta al sitemap.
// La enforcement dura vive en middleware.ts; robots.txt es la señal que los bots
// reputados respetan (clave para que los asistentes de IA no bajen las fotos).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
      {
        userAgent: AI_ASSISTANTS,
        allow: '/',
        disallow: ['/_next/image', ...PRIVATE_PATHS],
      },
      {
        userAgent: AI_HARVESTERS,
        disallow: '/',
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  }
}
