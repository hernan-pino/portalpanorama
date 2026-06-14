import { put, del } from '@vercel/blob'
import { StorageService } from '@application/ports/StorageService'

// Almacena imágenes en Vercel Blob (nativo del deploy). El host resultante
// (*.public.blob.vercel-storage.com) ya está en la allowlist de next/image.
// Alternativa no cableada: UploadThingStorageService (ver ese archivo).
export class VercelBlobStorageService implements StorageService {
  constructor() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not set')
    }
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    // Sanitiza el nombre y antepone una carpeta + sufijo aleatorio para evitar
    // colisiones (addRandomSuffix lo agrega Blob, pero el prefijo da orden).
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '_')
    const blob = await put(`places/${safeName}`, buffer, {
      access: 'public',
      contentType: mimeType,
      addRandomSuffix: true,
    })
    return blob.url
  }

  async delete(url: string): Promise<void> {
    await del(url)
  }
}
