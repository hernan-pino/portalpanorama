// Una variante de la imagen a un ancho dado (webp). El pipeline genera varias
// (400/800/1600) para servir el tamaño justo sin depender del optimizador de Vercel.
export interface ResponsiveVariant {
  width: number
  buffer: Buffer
}

export interface ResponsiveImage {
  variants: ResponsiveVariant[]
  mimeType: string
  extension: string
}

// Normaliza y comprime una imagen antes de almacenarla. Devuelve VARIOS anchos
// pre-generados: el storage los sube con una base común y el loader propio de
// next/image elige el más cercano — cero transformaciones de Vercel.
export interface ImageProcessor {
  compressResponsive(buffer: Buffer): Promise<ResponsiveImage>
}
