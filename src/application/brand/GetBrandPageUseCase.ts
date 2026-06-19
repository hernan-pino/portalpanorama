import { BrandPageView, BrandRepository } from '../ports/BrandRepository'
import { BrandNotFoundError } from '@domain/brand/errors/BrandNotFoundError'

// Página pública /marca/[slug]: la marca + sus sucursales publicadas. Lanza si la
// marca no existe (la ruta → notFound()).
export class GetBrandPageUseCase {
  constructor(private readonly brandRepo: BrandRepository) {}

  async execute(slug: string): Promise<BrandPageView> {
    const page = await this.brandRepo.getPageBySlug(slug)
    if (!page) throw new BrandNotFoundError(slug)
    return page
  }
}
