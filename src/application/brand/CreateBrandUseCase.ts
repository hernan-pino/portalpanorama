import { createId } from '@paralleldrive/cuid2'
import { Brand } from '@domain/brand/Brand'
import { Slug } from '@domain/shared/Slug'
import { BrandRepository } from '../ports/BrandRepository'
import { BrandWriteInput } from './BrandWriteInput'

// Alta de una marca por el admin. El slug se deriva del nombre (Brand.create valida
// el nombre no vacío). La unicidad del slug la garantiza la BD (índice @unique).
export class CreateBrandUseCase {
  constructor(private readonly brandRepo: BrandRepository) {}

  async execute(input: BrandWriteInput): Promise<{ brandId: string }> {
    const brand = Brand.create({
      id: createId(),
      slug: Slug.generate(input.name),
      name: input.name,
      logoUrl: input.logoUrl,
      description: input.description,
      website: input.website,
      instagram: input.instagram,
      socialLinks: input.socialLinks,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await this.brandRepo.save(brand)
    return { brandId: brand.id }
  }
}
