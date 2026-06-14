import type { MetadataRoute } from 'next'
import { absoluteUrl, siteUrl } from '@lib/siteUrl'

// robots.txt: indexar lo público, bloquear panel/cuenta/auth/API. Apunta al sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/mi-cuenta', '/api', '/login', '/registro'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteUrl,
  }
}
