export interface FetchedImage {
  buffer: Buffer
  contentType?: string
}

// Error con mensaje accionable y seguro para mostrar al usuario (sin filtrar
// internals). La action lo distingue por instanceof para devolver err.message.
export class ImageFetchError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImageFetchError'
  }
}

// Descarga una imagen desde una URL remota arbitraria de forma segura (guardas
// anti-SSRF, límite de tamaño, timeout). La implementación vive en infraestructura.
export interface ImageFetcher {
  fetch(url: string): Promise<FetchedImage>
}
