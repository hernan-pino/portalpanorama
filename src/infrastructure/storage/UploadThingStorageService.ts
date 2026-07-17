// ALTERNATIVA NO CABLEADA — camino a futuro, tal vez.
// El storage en uso es VercelBlobStorageService (nativo del deploy, ya aprovisionado;
// ver container.ts y la decisión en PLAN_FASE9.md). Esta implementación de StorageService
// con UploadThing se conserva como opción de respaldo. Para activarla habría que:
//   1) agregar su host (utfs.io) a ALLOWED_IMAGE_HOSTS en src/lib/imageHosts.ts,
//   2) apuntar getUploadPlaceImageUseCase() a esta clase en container.ts,
//   3) tener UPLOADTHING_TOKEN seteado.
import { UTApi } from 'uploadthing/server'
import { StorageService } from '@application/ports/StorageService'
import { ResponsiveVariant } from '@application/ports/ImageProcessor'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export class UploadThingStorageService implements StorageService {
  private readonly utapi: UTApi

  constructor() {
    if (!process.env.UPLOADTHING_TOKEN) {
      throw new Error('UPLOADTHING_TOKEN is not set')
    }
    this.utapi = new UTApi()
  }

  // Backup no cableado: UploadThing sirve desde utfs.io.
  isOwnUrl(url: string): boolean {
    try {
      return new URL(url).host.toLowerCase().endsWith('utfs.io')
    } catch {
      return false
    }
  }

  // Backup no cableado: UploadThing devuelve keys opacas (no la convención
  // `-<ancho>.webp` que usa el loader), así que sube solo la variante mayor y la
  // sirve a tamaño único. Si algún día se cablea, migrar a un storage con nombres
  // predecibles (como Vercel Blob) para aprovechar los 3 anchos.
  async uploadResponsive(
    variants: ResponsiveVariant[],
    baseName: string,
    mimeType: string,
    extension: string,
  ): Promise<string> {
    const largest = variants.reduce((a, b) => (b.width > a.width ? b : a))
    return this.upload(largest.buffer, `${baseName}.${extension}`, mimeType)
  }

  private async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new Error(`Tipo de archivo no permitido: ${mimeType}`)
    }
    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error(`El archivo supera el límite de ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`)
    }

    // Sanitizar nombre: solo caracteres seguros, sin separadores de path
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '_')

    const file = new File([new Uint8Array(buffer)], safeName, { type: mimeType })
    const response = await this.utapi.uploadFiles(file)

    if (response.error) {
      throw new Error(`UploadThing upload failed: ${response.error.message}`)
    }

    return response.data.ufsUrl
  }

  async delete(url: string): Promise<void> {
    // UploadThing key = último segmento de la URL (solo caracteres alfanuméricos)
    const key = url.split('/').pop()
    if (!key || !/^[\w-]+$/.test(key)) {
      throw new Error(`Key inválida extraída de la URL: ${url}`)
    }
    await this.utapi.deleteFiles(key)
  }
}
