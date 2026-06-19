import type { BrandPageView } from '@application/ports/BrandRepository'
import { absoluteUrl } from '@lib/siteUrl'

function withProtocol(url: string): string {
  return /^https?:\/\//.test(url) ? url : `https://${url}`
}
function instagramHref(handle: string): string {
  if (/^https?:\/\//.test(handle)) return handle
  return `https://instagram.com/${handle.replace(/^@/, '')}`
}

// JSON-LD schema.org/Organization de la marca: agrupa sus sucursales como `location`.
// Google y los LLMs lo usan para entender que los locales son de un mismo negocio.
export function brandJsonLd(brand: BrandPageView, slug: string): Record<string, unknown> {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: absoluteUrl(`/marca/${slug}`),
  }

  if (brand.description) ld.description = brand.description
  if (brand.logoUrl) ld.logo = brand.logoUrl

  const sameAs: string[] = []
  if (brand.website) sameAs.push(withProtocol(brand.website))
  if (brand.instagram) sameAs.push(instagramHref(brand.instagram))
  for (const s of brand.socialLinks) sameAs.push(withProtocol(s.url))
  if (sameAs.length) ld.sameAs = sameAs

  // Cada sucursal publicada como ubicación del negocio.
  if (brand.places.length) {
    ld.location = brand.places.map((p) => ({
      '@type': 'LocalBusiness',
      name: p.name,
      url: absoluteUrl(`/lugar/${p.slug}`),
      address: { '@type': 'PostalAddress', addressLocality: p.communeName, addressCountry: 'CL' },
    }))
  }

  return ld
}
