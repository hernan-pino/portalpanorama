// Hosts permitidos para imágenes de lugares. Fuente única de verdad:
// next.config.ts los mapea a `images.remotePatterns` (next/image rechaza con 500
// cualquier host fuera de la lista) y el form de admin valida contra la misma
// lista al guardar, para que una URL mala nunca tumbe la ficha en runtime.
export const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  '*.public.blob.vercel-storage.com',
] as const

export function isAllowedImageUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url)
    if (protocol !== 'https:') return false
    return ALLOWED_IMAGE_HOSTS.some((pattern) =>
      pattern.startsWith('*.') ? hostname.endsWith(pattern.slice(1)) : hostname === pattern,
    )
  } catch {
    return false
  }
}
