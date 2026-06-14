export interface ProcessedImage {
  buffer: Buffer
  mimeType: string
  extension: string
}

// Comprime/normaliza una imagen antes de almacenarla, para que la ficha cargue
// liviano sin importar el peso del archivo original (foto de teléfono, PNG enorme).
export interface ImageProcessor {
  compress(buffer: Buffer): Promise<ProcessedImage>
}
