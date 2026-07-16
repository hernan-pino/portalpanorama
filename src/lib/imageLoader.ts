// Loader propio de next/image. Reemplaza al optimizador de Vercel (cuota agotada):
// las fotos ya se pre-generan en 3 anchos al subir (ver SharpImageProcessor +
// VercelBlobStorageService), con nombres `…-<ancho>.webp`. Aquí elegimos el ancho
// pre-generado más cercano al que pide next/image y devolvemos esa URL directa.
// Resultado: CERO transformaciones de Vercel.
//
// Las imágenes que no siguen la convención (externas, legacy sin reprocesar) se
// devuelven tal cual → se sirven a tamaño único, sin romperse.
const BUCKETS = [400, 800, 1600] as const
const RESPONSIVE_RE = /-(?:400|800|1600)\.webp(?=\?|$)/

export default function blobImageLoader({
  src,
  width,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (!RESPONSIVE_RE.test(src)) return src
  const bucket = BUCKETS.find((b) => b >= width) ?? BUCKETS[BUCKETS.length - 1]
  return src.replace(RESPONSIVE_RE, `-${bucket}.webp`)
}
