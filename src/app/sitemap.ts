import type { MetadataRoute } from 'next'
import { container } from '@lib/container'
import { absoluteUrl } from '@lib/siteUrl'

// sitemap.xml: rutas públicas estáticas + una entrada por lugar publicado. Las
// rutas privadas (admin, mi-cuenta, auth) quedan fuera (las bloquea robots.ts).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const places = await container.getGetSitemapEntriesUseCase().execute()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/explorar'), changeFrequency: 'daily', priority: 0.8 },
  ]

  const placeRoutes: MetadataRoute.Sitemap = places.map((p) => ({
    url: absoluteUrl(`/lugar/${p.slug}`),
    lastModified: p.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...placeRoutes]
}
