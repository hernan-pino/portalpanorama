import { BrandRepository } from '../ports/BrandRepository'
import { BrandNotFoundError } from '@domain/brand/errors/BrandNotFoundError'

// Read-model plano para precargar el form de edición del admin. Espeja
// BrandWriteInput + id/slug de solo lectura. No es el agregado (presentation no lo muta).
export interface BrandEditView {
  id: string
  slug: string
  name: string
  logoUrl?: string
  description?: string
  website?: string
  instagram?: string
  socialLinks: { network: string; url: string }[]
}

export class GetBrandForEditUseCase {
  constructor(private readonly brandRepo: BrandRepository) {}

  async execute(id: string): Promise<BrandEditView> {
    const brand = await this.brandRepo.findById(id)
    if (!brand) throw new BrandNotFoundError(id)

    return {
      id: brand.id,
      slug: brand.slug.value,
      name: brand.name,
      logoUrl: brand.logoUrl,
      description: brand.description,
      website: brand.website,
      instagram: brand.instagram,
      socialLinks: brand.socialLinks.map((s) => ({ network: s.network, url: s.url })),
    }
  }
}
