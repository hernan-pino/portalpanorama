import { ImageFetcher } from '@application/ports/ImageFetcher'
import { ImageProcessor } from '@application/ports/ImageProcessor'
import { StorageService } from '@application/ports/StorageService'

export interface ImportImageFromUrlInput {
  url: string
}

// "Traer desde URL": descarga la imagen de una web cualquiera (con guardas en el
// fetcher), la comprime y la rehospeda en el storage propio, devolviendo la URL
// final (ya de un host permitido). Así no se hotlinkea contra terceros.
export class ImportImageFromUrlUseCase {
  constructor(
    private readonly fetcher: ImageFetcher,
    private readonly processor: ImageProcessor,
    private readonly storage: StorageService,
  ) {}

  async execute(input: ImportImageFromUrlInput): Promise<{ url: string }> {
    const { buffer } = await this.fetcher.fetch(input.url)
    const processed = await this.processor.compressResponsive(buffer)

    // Nombre desde el último segmento del path, sin extensión; fallback 'imagen'.
    let base = 'imagen'
    try {
      const last = new URL(input.url).pathname.split('/').filter(Boolean).pop()
      if (last) base = decodeURIComponent(last).replace(/\.[^.]+$/, '').trim() || 'imagen'
    } catch {
      /* URL ya validada en el fetcher; si falla, queda el fallback */
    }

    const url = await this.storage.uploadResponsive(
      processed.variants,
      base,
      processed.mimeType,
      processed.extension,
    )
    return { url }
  }
}
