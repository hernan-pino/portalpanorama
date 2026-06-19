import { Brand } from '@domain/brand/Brand'
import { BrandNotFoundError } from '@domain/brand/errors/BrandNotFoundError'
import { BrandRepository } from '../ports/BrandRepository'
import { BrandWriteInput } from './BrandWriteInput'

// Edición de una marca. Conserva el slug original (cambiarlo rompería la URL
// /marca/[slug] y su SEO) y la fecha de creación. Solo reescribe los datos editables.
export class UpdateBrandUseCase {
  constructor(private readonly brandRepo: BrandRepository) {}

  async execute(id: string, input: BrandWriteInput): Promise<void> {
    const existing = await this.brandRepo.findById(id)
    if (!existing) throw new BrandNotFoundError(id)

    const brand = Brand.create({
      id: existing.id,
      slug: existing.slug,
      name: input.name,
      logoUrl: input.logoUrl,
      description: input.description,
      website: input.website,
      instagram: input.instagram,
      socialLinks: input.socialLinks,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    })

    await this.brandRepo.save(brand)
  }
}
