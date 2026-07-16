import sharp from 'sharp'
import { ImageProcessor, ResponsiveImage, ResponsiveVariant } from '@application/ports/ImageProcessor'

// Tres anchos que cubren tarjeta, galería y hero en pantallas retina. Se pre-generan
// al subir (o al reprocesar) para que next/image sirva el tamaño justo vía loader
// propio, sin gastar transformaciones de Vercel. webp q80 = buen balance peso/nitidez.
// `withoutEnlargement` evita agrandar fotos chicas: el ancho mayor puede quedar < 1600.
const WIDTHS = [400, 800, 1600]
const WEBP_QUALITY = 80

export class SharpImageProcessor implements ImageProcessor {
  async compressResponsive(buffer: Buffer): Promise<ResponsiveImage> {
    // Normaliza la orientación EXIF una sola vez (fotos de teléfono salen derechas)
    // y reusa ese buffer para cada resize.
    const normalized = await sharp(buffer).rotate().toBuffer()

    const variants: ResponsiveVariant[] = []
    for (const width of WIDTHS) {
      const out = await sharp(normalized)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer()
      variants.push({ width, buffer: out })
    }

    return { variants, mimeType: 'image/webp', extension: 'webp' }
  }
}
