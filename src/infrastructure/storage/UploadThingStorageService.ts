import { UTApi } from 'uploadthing/server'
import { StorageService } from '@application/ports/StorageService'

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

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
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
