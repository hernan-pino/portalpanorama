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
}
