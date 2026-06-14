import sharp from 'sharp'
import { ImageProcessor, ProcessedImage } from '@application/ports/ImageProcessor'

// Tope de lado largo: suficiente para hero/galería en pantallas retina sin guardar
// archivos gigantes. webp con calidad 80 = buen balance peso/nitidez.
const MAX_DIMENSION = 2000
const WEBP_QUALITY = 80

export class SharpImageProcessor implements ImageProcessor {
  async compress(buffer: Buffer): Promise<ProcessedImage> {
    const out = await sharp(buffer)
      .rotate() // respeta la orientación EXIF (fotos de teléfono salen derechas)
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    return { buffer: out, mimeType: 'image/webp', extension: 'webp' }
  }
}
