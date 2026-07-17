import { ResponsiveVariant } from './ImageProcessor'

export interface StorageService {
  // Sube las variantes de una imagen con una base común y devuelve la URL canónica
  // (la del ancho mayor). Las 3 comparten prefijo `…-<ancho>.<ext>` para que el
  // loader de next/image derive los otros tamaños sin llamar al optimizador.
  uploadResponsive(
    variants: ResponsiveVariant[],
    baseName: string,
    mimeType: string,
    extension: string,
  ): Promise<string>
  delete(url: string): Promise<void>

  // ¿Esta URL ya vive en nuestro storage? Quién la reconoce es el adapter (sabe su
  // propio host); el use case solo pregunta. Permite no re-subir lo que ya está:
  // el store es compartido entre entornos, así que una ficha ingestada en local ya
  // dejó sus blobs disponibles para prod.
  isOwnUrl(url: string): boolean
}
