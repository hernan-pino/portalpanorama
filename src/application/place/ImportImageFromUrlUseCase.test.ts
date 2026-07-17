import { describe, it, expect, vi } from 'vitest'
import { ImportImageFromUrlUseCase } from './ImportImageFromUrlUseCase'
import { ImageFetcher } from '@application/ports/ImageFetcher'
import { ImageProcessor } from '@application/ports/ImageProcessor'
import { StorageService } from '@application/ports/StorageService'

const OWN = 'https://store123.public.blob.vercel-storage.com/places/obolo-abc-1600.webp'
const AJENA = 'https://obolochocolate.cl/cdn/shop/files/foto.jpg'

function makeDeps(isOwn: (url: string) => boolean) {
  const fetcher: ImageFetcher = { fetch: vi.fn().mockResolvedValue({ buffer: Buffer.from('img') }) }
  const processor: ImageProcessor = {
    compressResponsive: vi.fn().mockResolvedValue({
      variants: [{ width: 1600, buffer: Buffer.from('x') }],
      mimeType: 'image/webp',
      extension: 'webp',
    }),
  } as unknown as ImageProcessor
  const storage: StorageService = {
    uploadResponsive: vi.fn().mockResolvedValue('https://store123.public.blob.vercel-storage.com/places/nueva-1600.webp'),
    delete: vi.fn(),
    isOwnUrl: vi.fn().mockImplementation(isOwn),
  }
  return { fetcher, processor, storage }
}

describe('ImportImageFromUrlUseCase', () => {
  it('una URL que ya es nuestra se devuelve tal cual, sin descargar ni re-subir', () => {
    const { fetcher, processor, storage } = makeDeps((u) => u === OWN)
    const uc = new ImportImageFromUrlUseCase(fetcher, processor, storage)
    return uc.execute({ url: OWN }).then((res) => {
      expect(res.url).toBe(OWN)
      // Lo que protege la cuota: cero fetch, cero proceso, cero subida.
      expect(fetcher.fetch).not.toHaveBeenCalled()
      expect(processor.compressResponsive).not.toHaveBeenCalled()
      expect(storage.uploadResponsive).not.toHaveBeenCalled()
    })
  })

  it('una URL ajena sí se descarga, comprime y rehospeda', async () => {
    const { fetcher, processor, storage } = makeDeps(() => false)
    const uc = new ImportImageFromUrlUseCase(fetcher, processor, storage)
    const res = await uc.execute({ url: AJENA })
    expect(fetcher.fetch).toHaveBeenCalledWith(AJENA)
    expect(storage.uploadResponsive).toHaveBeenCalled()
    expect(res.url).toContain('blob.vercel-storage.com')
  })
})
