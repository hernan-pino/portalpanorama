import { put, del } from '@vercel/blob'
import { createId } from '@paralleldrive/cuid2'
import { StorageService } from '@application/ports/StorageService'
import { ResponsiveVariant } from '@application/ports/ImageProcessor'

// Almacena imágenes en Vercel Blob (nativo del deploy). El host resultante
// (*.public.blob.vercel-storage.com) ya está en la allowlist de next/image.
// Alternativa no cableada: UploadThingStorageService (ver ese archivo).
export class VercelBlobStorageService implements StorageService {
  constructor() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not set')
    }
  }

  async uploadResponsive(
    variants: ResponsiveVariant[],
    baseName: string,
    mimeType: string,
    extension: string,
  ): Promise<string> {
    // Base compartida por las 3 variantes: nombre saneado + id único. Cada archivo
    // termina en `-<ancho>.<ext>`, patrón del que el loader deriva los otros tamaños.
    // Sin addRandomSuffix (el id ya garantiza unicidad y hace la base predecible).
    const safeBase = baseName
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/^\.+/, '_')
      .slice(0, 60)
    const id = createId()
    const largest = Math.max(...variants.map((v) => v.width))

    let canonical = ''
    for (const v of variants) {
      const blob = await put(`places/${safeBase}-${id}-${v.width}.${extension}`, v.buffer, {
        access: 'public',
        contentType: mimeType,
        addRandomSuffix: false,
      })
      if (v.width === largest) canonical = blob.url
    }
    return canonical
  }

  async delete(url: string): Promise<void> {
    await del(url)
  }
}
