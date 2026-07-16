import { ImageProcessor } from '@application/ports/ImageProcessor'
import { StorageService } from '@application/ports/StorageService'

export interface UploadPlaceImageInput {
  buffer: Buffer
  filename: string
}

// Comprime la imagen (a webp liviano) y la almacena, devolviendo la URL pública
// lista para guardar en el Place. El caller (action) ya validó tipo/tamaño/sesión.
export class UploadPlaceImageUseCase {
  constructor(
    private readonly processor: ImageProcessor,
    private readonly storage: StorageService,
  ) {}

  async execute(input: UploadPlaceImageInput): Promise<{ url: string }> {
    const processed = await this.processor.compressResponsive(input.buffer)
    const base = input.filename.replace(/\.[^.]+$/, '').trim() || 'imagen'
    const url = await this.storage.uploadResponsive(
      processed.variants,
      base,
      processed.mimeType,
      processed.extension,
    )
    return { url }
  }
}
