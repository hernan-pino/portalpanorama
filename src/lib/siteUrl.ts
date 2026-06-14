// URL pública del sitio — única fuente para canonical, OpenGraph y sitemap/robots.
// El env se lee acá (lib/ tiene permitido `process.env`); el resto del código la
// consume sin tocar el entorno. Sin barra final para concatenar paths sin dobles
// barras. En prod se setea NEXT_PUBLIC_BASE_URL (ej. https://portalpanorama.cl).
const RAW = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export const siteUrl = RAW.replace(/\/+$/, '')

export function absoluteUrl(path: string): string {
  return path.startsWith('/') ? `${siteUrl}${path}` : `${siteUrl}/${path}`
}
