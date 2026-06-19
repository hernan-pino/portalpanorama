// DTO plano del form de marca (cliente → server action). Strings de <input>; la
// action valida y coacciona con Zod. socialLinks como array serializable.

export interface BrandSocialLinkValues {
  network: string
  url: string
}

export interface BrandFormValues {
  name: string
  logoUrl: string
  description: string
  website: string
  instagram: string
  socialLinks: BrandSocialLinkValues[]
}

// Redes para el <select> de socialLinks (Instagram va aparte como campo propio).
export const BRAND_SOCIAL_NETWORK_OPTIONS = [
  'WhatsApp',
  'Facebook',
  'TikTok',
  'YouTube',
  'X',
  'Threads',
  'Spotify',
  'LinkedIn',
  'Otra',
] as const
