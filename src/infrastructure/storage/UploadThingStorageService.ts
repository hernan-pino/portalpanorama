import { UTApi } from 'uploadthing/server'
import { StorageService } from '@application/ports/StorageService'

export class UploadThingStorageService implements StorageService {
  private readonly utapi: UTApi

  constructor() {
    if (!process.env.UPLOADTHING_TOKEN) {
      throw new Error('UPLOADTHING_TOKEN is not set')
    }
    this.utapi = new UTApi()
  }

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const file = new File([new Uint8Array(buffer)], filename, { type: mimeType })
    const response = await this.utapi.uploadFiles(file)

    if (response.error) {
      throw new Error(`UploadThing upload failed: ${response.error.message}`)
    }

    return response.data.ufsUrl
  }

  async delete(url: string): Promise<void> {
    // UploadThing uses the file key (last segment of the URL) to delete
    const key = url.split('/').pop()
    if (!key) throw new Error(`No se pudo extraer la key de la URL: ${url}`)
    await this.utapi.deleteFiles(key)
  }
}
